#!/usr/bin/env bash

# Exit script if a statement returns a non-true return value.
set -o errexit

# Use the error status of the first failure, rather than that of the last item in a pipeline.
set -o pipefail

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

# testing
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

if [[ ! -z "${ORIGINATING_SHA1}" ]]; then
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
if [[ -z "${ORIGINATING_DEVELOPER}" ]]; then
  ORIGINATING_DEVELOPER="unset"
fi

# build out slack DM &/or notification
SLACK_UID="$(./.circleci/utilities/github_username_to_slack_uid.sh ${ORIGINATING_DEVELOPER})"
SLACK_MENTIONS="<${SLACK_UID}>"
echo "SLACK_MENTIONS: ${SLACK_MENTIONS}"

# IS THIS LEGACY CODE? I DONT SEE EVIDENCE THAT MOCHA IS BEING USED ELSEWHERE. (Kellen)
# create failure message from mocha output
TMP_MSG=""
if [[ "${SLACK_BUILD_STATUS}" = "fail" ]]; then
  for file in cypress/reports/mocha/*.json; do
    ERR=$(cat ${file} | jq '.results | .[0] | .suites | .[0] | .tests | .[0] | .err | .message')
    if [[ "${ERR}" != "null" ]]; then
      TMP_MSG+="${ERR} "
    fi
  done
fi
FAILURE_MSG=$(echo -e ${TMP_MSG} | awk '{ gsub(/\"|\[|\]|,/, ""); print $0 }')
echo "FAILURE_MSG: ${FAILURE_MSG}"

# TODO: determine why the FAILURE_MESSAGE is causing an invalid_payload
# and then add the following back into the slack message
# \"fields\": [ \
#   { \
#     \"title\": \"Failures\", \
#     \"value\": \"${FAILURE_MSG}\"
#   }, \
# ], \

# determine failure message channel (#tech-errors or DM)
# DM only due to noise
#FAILURE_MESSAGE_CHANNEL="#tech-errors"

# message icon
VOUCH_ICON=":vouchfail:"
if [[ "${SLACK_BUILD_STATUS}" = "success" ]]; then
  VOUCH_ICON=":vouch:"
fi

# testing
echo "testing 1"

# to whom to target message
SLACK_NOTIFY="${ORIGINATING_DEVELOPER:-vouch_dev}"
if [[ "${SLACK_BUILD_STATUS}" != "success" ]]; then
  SLACK_NOTIFY+=" ${SLACK_MENTIONS}"
fi

# testing
echo "testing 2"

# attempt to build url to the cypress run in the dashboard
RUN_URL="https://dashboard.cypress.io/#/projects/iukrxp/runs"
# from the output of the cypress run - cf. .circleci/config.yml

### COMMENTED OUT BECAUSE THIS FILE PATH CANT BE FOUND.
# input="./cypress_output.txt"
# while IFS= read -r line
# do
#   # find the line and remove the text we don't need
#   if [[ "${line}" == *"Recorded"*"iukrxp"* ]]; then
#     RUN_URL=$(echo "$line" | awk '{ gsub(/Recorded Run:| /, "") ; print $0 }')
#     # link to failures tab in case of failures
#     if [[ "${SLACK_BUILD_STATUS}" = "fail" ]]; then
#       RUN_URL+="/failures"
#     fi
#   fi
# done < "${input}"

# build the message content
MESSAGE="${VOUCH_ICON} marketingqa publish_site test ${SLACK_BUILD_STATUS}! <${RUN_URL}|Cypress Dashboard> | <${CIRCLE_BUILD_URL}|CircleCI Job>\n"
MESSAGE+="<${ORIGINATING_BUILD_URL}|${ORIGINATING_PROJECT_REPONAME:-marketingqa} job run> for git branch ${ORIGINATING_BRANCH}\n"
### MESSAGE+="(<${COMMIT_URL:-unset}|${SHORT_SHA1}> by ${SLACK_NOTIFY}) ${SHORT_GIT_MESSAGE}\n"

# testing
echo "testing 3"

# and add PR to message if available
if [[ ! -z "${ORIGINATING_PULL_REQUEST}" ]]; then
  PR_NUM=$(echo "${ORIGINATING_PULL_REQUEST}" | awk -F/ '{print $NF}')
  MESSAGE+="<${ORIGINATING_PULL_REQUEST}|${ORIGINATING_PROJECT_REPONAME} pull request #${PR_NUM}>"
fi

# testing
echo "testing 4"

# cannot use orb in version 2.0 so cargo culting the slack code for slack/status
# https://github.com/CircleCI-Public/slack-orb/blob/staging/src/commands/status.yml
if [[ "${SLACK_BUILD_STATUS}" = "success" ]]; then
  # testing
  echo "testing 5"

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
  echo "Job completed successfully. Alert sent."

elif [[ "${SLACK_BUILD_STATUS}" != "success" && ${ORIGINATING_BRANCH} != "master" && "${SLACK_UID}" != "!here" ]]; then
   # testing
  echo "testing 6"


# TODO - UPDATE THIS PAYLOAD ONCE THE ABOVE ONE (FOR SUCCESSES) WORKS.
  FAILURE_MESSAGE_CHANNEL="${SLACK_UID}"
  curl -X POST -H 'Content-type: application/json' \
    --data "{ \
              \"channel\": \"${FAILURE_MESSAGE_CHANNEL}\", \
              \"title\": \"MarketingQA Publish_Site Test Results\", \
              \"title_link\": \"https://circleci.com/gh/svinstech/workflows/marketingqa\", \
              \"attachments\": [ \
                { \
                  \"fallback\": \"marketingqa publish_site tests failed. https://dashboard.cypress.io/#/projects/iukrxp/runs\", \
                  \"text\": \"${MESSAGE}\", \
                  \"color\": \"#ed5c5c\" \
                } \
              ] \
            } " ${SLACK_FAILURE_WEBHOOK}
  echo "Job failed. Alert sent."
else
  echo "Job failed. Alert not sent."
fi
