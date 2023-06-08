# Automated Link-Checker
## What is it?
The Link-Checker is a set a Cypress tests that check a random sample of application links on Vouch.us web pages to ensure that they lead to the correct destination when clicked.

An application link is a link that leads to the beginning of an insurance application.

Some of these links are client-specific. Those ones will ALL be tested, instead of just a random sample of them since they could potentially all work differently.

## Where is the code?
The bulk of the code for these tests can be found here: *cypress/integration/application_link_checker.ts*

## How is it used?
Whenever a new version of Vouch.us is published, [WebFlow](https://webflow.com/dashboard/sites/vouch-brand-refresh-67bc5-1867061c16988/integrations) pings a site_publish web-hook that Zapier (sign in with the Houdini creds from the EPaD Vault in 1Password) is listening for. When Zapier registers this ping, it tells CircleCI to execute a job on the [Link-Checker pipeline](https://app.circleci.com/pipelines/github/svinstech/marketingqa?branch=main).
This CircleCI pipeline runs the Link-Checker tests.

When the tests finish running, the status of the CircleCI build will be conveyed in a message sent to the tech-ci Slack channel.

If you'd like to execute the test script manually:
-Open a terminal
-Navigate to the root of this project
-Run *yarn cypress open* to open Cypress
-In Cypress, click *integration/application_link_checker.ts* to start the tests.


## Why do we need this?
When an update is made to any pages under the Vouch.us domain, we must ensure that this update didn't break any of our application links. Doing this manually would be too time-consuming, so we have automated that process.

## Who was involved?
It was originally requested by Gabe Tiger in 2022. 
The work was started by Jason McFarland in 2022. 
The work was finished and is maintained by Kellen Kincaid (2023-present).

