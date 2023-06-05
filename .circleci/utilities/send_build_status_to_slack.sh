#!/usr/bin/env bash

# Exit script if a statement returns a non-true return value.
set -o errexit

# Use the error status of the first failure, rather than that of the last item in a pipeline.
# set -o pipefail

SLACK_SUCCESS_WEBHOOK=$SLACK_LINK_CHECKER_INCOMING_WEBHOOK
SLACK_FAILURE_WEBHOOK=$SLACK_LINK_CHECKER_INCOMING_WEBHOOK


echo "CIRCLE_PROJECT_REPONAME: ${CIRCLE_PROJECT_REPONAME}"
echo "CIRCLE_BUILD_NUM: ${CIRCLE_BUILD_NUM}"
echo "CIRCLE_BUILD_URL: ${CIRCLE_BUILD_URL}"

echo "SLACK_BUILD_STATUS: ${SLACK_BUILD_STATUS}"
echo "SLACK_SUCCESS_WEBHOOK: ${SLACK_SUCCESS_WEBHOOK}"
echo "SLACK_FAILURE_WEBHOOK: ${SLACK_FAILURE_WEBHOOK}"

# if not triggered from originating project
# set those variables to the matching ones from circleci
if [ -z "${ORIGINATING_SHA1}" ]; then
  ORIGINATING_SHA1="${CIRCLE_SHA1}"
fi

if [ -z "${ORIGINATING_PROJECT_REPONAME}" ]; then
  ORIGINATING_PROJECT_REPONAME="${CIRCLE_PROJECT_REPONAME}"
fi

if [ -z "${ORIGINATING_PROJECT_USERNAME}" ]; then
  ORIGINATING_PROJECT_USERNAME="${CIRCLE_PROJECT_USERNAME}"
fi

if [ -z "${ORIGINATING_DEVELOPER}" ]; then
  ORIGINATING_DEVELOPER="${CIRCLE_USERNAME}"
fi

if [ -z "${ORIGINATING_BRANCH}" ]; then
  ORIGINATING_BRANCH="${CIRCLE_BRANCH}"
fi

if [ -z "${ORIGINATING_BUILD_URL}" ]; then
  ORIGINATING_BUILD_URL="${CIRCLE_BUILD_URL}"
fi

if [ -z "${ORIGINATING_PULL_REQUEST}" ]; then
  ORIGINATING_PULL_REQUEST="${CIRCLE_PULL_REQUEST}"
fi

if [ -z "${SLACK_SUCCESS_WEBHOOK}" ]; then
  echo "!!! SLACK_SUCCESS_WEBHOOK not set."
fi

echo "ORIGINATING_PULL_REQUEST: ${ORIGINATING_PULL_REQUEST}"
echo "ORIGINATING_DEVELOPER: ${ORIGINATING_DEVELOPER}"
echo "ORIGINATING_BRANCH: ${ORIGINATING_BRANCH}"
echo "ORIGINATING_SHA1: ${ORIGINATING_SHA1}"
echo "ORIGINATING_PROJECT_REPONAME: ${ORIGINATING_PROJECT_REPONAME}"
echo "ORIGINATING_PROJECT_USERNAME: ${ORIGINATING_PROJECT_USERNAME}"
echo "ORIGINATING_BUILD_URL: ${ORIGINATING_BUILD_URL}"

if [ ! -z "${ORIGINATING_SHA1}" ]; then
  # build the url to the commit
  COMMIT_URL="https://github.com/${ORIGINATING_PROJECT_USERNAME}/${ORIGINATING_PROJECT_REPONAME}/commit/${ORIGINATING_SHA1}"

  SHORT_SHA1=$(echo ${ORIGINATING_SHA1} | cut -c 1-7)

####### COMMENTED OUT BECAUSE jq WAS NOT RECOGNIZED AND CAUSED AN ERROR.
  # get the git commit message for the originating sha1
  ### GIT_COMMIT_MESSAGE=$(curl -H "Authorization: token ${GITHUB_API_TOKEN}" https://api.github.com/repos/${ORIGINATING_PROJECT_USERNAME}/${ORIGINATING_PROJECT_REPONAME}/git/commits/${ORIGINATING_SHA1} | jq '.message')
  # get first line of the commit message and remove the quotes
  ### SHORT_GIT_MESSAGE=$(echo -e ${GIT_COMMIT_MESSAGE} | head -n 1 | awk '{ gsub("\"", "") ; print $0 }')
fi

# notify slack user directly
# https://api.slack.com/docs/message-formatting#variables
if [ -z "${ORIGINATING_DEVELOPER}" ]; then
  ORIGINATING_DEVELOPER="unset"
fi

# build out slack DM &/or notification
SLACK_UID="$(./.circleci/utilities/github_username_to_slack_uid.sh ${ORIGINATING_DEVELOPER})"
SLACK_MENTIONS="<${SLACK_UID}>"
echo "SLACK_MENTIONS: ${SLACK_MENTIONS}"

# message icon
VOUCH_ICON=":vouchfail:"
if [ "${SLACK_BUILD_STATUS}" = "success" ]; then
  VOUCH_ICON=":vouch:"
fi

# to whom to target message
SLACK_NOTIFY_PART1="${ORIGINATING_DEVELOPER:-vouch_dev}"
SLACK_NOTIFY_PART2=""
if [ "${SLACK_BUILD_STATUS}" != "success" ]; then
  SLACK_NOTIFY_PART2=" ${SLACK_MENTIONS}"
fi

SLACK_NOTIFY="${SLACK_NOTIFY_PART1}${SLACK_NOTIFY_PART2}"

# attempt to build url to the cypress run in the dashboard
RUN_URL="https://dashboard.cypress.io/#/projects/iukrxp/runs"
# from the output of the cypress run - cf. .circleci/config.yml


# build the message content
MESSAGE_PART1="${VOUCH_ICON} marketingqa publish_site test status: ${SLACK_BUILD_STATUS}! <${RUN_URL}|Cypress Dashboard> | <${CIRCLE_BUILD_URL}|CircleCI Job>\n"
MESSAGE_PART2="<${ORIGINATING_BUILD_URL}|${ORIGINATING_PROJECT_REPONAME:-"marketingqa"} job run> for git branch ${ORIGINATING_BRANCH}\n"
### MESSAGE+="(<${COMMIT_URL:-unset}|${SHORT_SHA1}> by ${SLACK_NOTIFY}) ${SHORT_GIT_MESSAGE}\n"
MESSAGE_PART3=""

# and add PR to message if available
if [ ! -z "${ORIGINATING_PULL_REQUEST}" ]; then
  PR_NUM=$(echo "${ORIGINATING_PULL_REQUEST}" | awk -F/ '{print $NF}')
  MESSAGE_PART3="<${ORIGINATING_PULL_REQUEST}|${ORIGINATING_PROJECT_REPONAME} pull request #${PR_NUM}>"
fi

# Construct message (NOTE: Concatenate stopped working for some reason...)
MESSAGE="${MESSAGE_PART1}${MESSAGE_PART2}${MESSAGE_PART3}"

JOB_STATUS=""

# https://github.com/CircleCI-Public/slack-orb/blob/staging/src/commands/status.yml
if [ "${SLACK_BUILD_STATUS}" = "success" ]; then
  curl -X POST -H 'Content-type: application/json' \
    --data "{ \
              \"blocks\": \
              [ \
                { \
                  \"type\": \"header\", \
                  \"text\": \
                  { \
                    \"type\": \"plain_text\", \
                    \"text\": \"MarketingQA Publish_Site Test Results\" \
                  } \
                }, \
                { \
                  \"type\": \"section\", \
                  \"text\": \
                    { \
                      \"type\": \"mrkdwn\", \
                      \"text\": \"<https://dashboard.cypress.io/#/projects/iukrxp/runs|marketingqa publish_site tests PASSED.>\n${MESSAGE}\" \
                    } \
                } \
              ] \
            }" "${SLACK_SUCCESS_WEBHOOK}"
  JOB_STATUS="Job completed successfully. Alert sent."

elif [ "${SLACK_BUILD_STATUS}" != "success" && ${ORIGINATING_BRANCH} != "master" && "${SLACK_UID}" != "!here" ]; then
  FAILURE_MESSAGE_CHANNEL="${SLACK_UID}"
  curl -X POST -H 'Content-type: application/json' \
    --data "{ \
              \"blocks\": \
              [ \
                { \
                  \"type\": \"header\", \
                  \"text\": \
                  { \
                    \"type\": \"plain_text\", \
                    \"text\": \"MarketingQA Publish_Site Test Results\" \
                  } \
                }, \
                { \
                  \"type\": \"section\", \
                  \"text\": \
                    { \
                      \"type\": \"mrkdwn\", \
                      \"text\": \"<https://dashboard.cypress.io/#/projects/iukrxp/runs|marketingqa publish_site tests FAILED.>\n${MESSAGE}\" \
                    } \
                } \
              ] \
            }" "${SLACK_FAILURE_WEBHOOK}"
  JOB_STATUS="Job failed. Alert sent."
else
  JOB_STATUS="Job failed. Alert not sent."
fi

echo "" # This is necessary because the status of the api request above was being put on the same line as the job status. Preprending the job status with \n didn't help.
echo "${JOB_STATUS}"
