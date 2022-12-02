#!/usr/bin/env bash

# We can get the user ids from the api
# https://slack.com/api/users.list?token=SLACK_TOKEN
# OR we can get the user id by going to https://svinsurance.slack.com/stats#members
# and clicking the user whose slack user id we're looking for. When you click on that user,
# their slack id will be in the url.
# or in various other ways as noted here
# https://api.slack.com/reference/surfaces/formatting#mentioning-users

case $1 in 
  "atomanyih")
    printf "@USXNZFNFP"
    ;;

  "bewatts")
    printf "@UHHPHLN5S"
    ;;

  "dhylbert")
    printf "@UR70HLLMB"
    ;;

  "evanroman")
    printf "@UDPSAK2BF"
    ;;

  "jeremyjpark")
    printf "@UHWLEPE64"
    ;;

  "KellenKincaid")
    printf "@U041LQ819EK"
    ;;

  "kongovi")
    printf "@UJJ9J2EFJ"
    ;;

  "LeahHeadd")
    printf "@UMUHD6HAA"
    ;;

  "Mongey")
    printf "@UGSQS5G64"
    ;;

  "nkeyes")
    printf "@UQSE6M1CY"
    ;;

  "pfriedman")
    printf "@UHY0T276E"
    ;;

  "stupakov")
    printf "@UKDTNC4ES"
    ;;

  "tonythomson")
    printf "@UQSU0AE75"
    ;;

  "tlhinman")
    printf "@ULQ063JQP"
    ;;

  "yuhunglin")
    printf "@UE7KZ1P18"
    ;;

  *)
    printf "!here"
    ;;

esac
