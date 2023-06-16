// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })


/*
    [ARGS]
    _targetUrlObject   =   A companyUrlObject representing a url and a company name.
                            This URL will be visited and have its application link tested.
                            The test will ensure that clicking the link leads to the application page.

    NOTE:
        undefined is also an expected type for _targetUrlObject.
        This is for the edge case where the array that is invoking this function on its contents
            tries to invoke it on an element that doesn't exist (index out-of-bounds).
*/

import { companyUrlObject } from "../interfaces/link_checker_interfaces";

/*
    [ARGS]
    _targetUrlObject        =   A companyUrlObject representing a url and a company name.
    _returnToOriginalUrl    =   Optional boolean. Defaults to true.
                                 If true, then it will go to the URL of _targetUrlObject at the end of the function.
*/
Cypress.Commands.add('ValidateApplicationPage', (_targetUrlObject :companyUrlObject, _returnToOriginalUrl :boolean = true) => {
    // Ensure that the resulting URL has the correct domain & partner slug..
    const vouchApplyDomain :string = 'https://apply.vouch.us/';
    const urlPartnerSlug :string = `partner=${_targetUrlObject.companyName}`;

    cy.url().should('contain', vouchApplyDomain);
    cy.url().should('contain', urlPartnerSlug);

    //  Debugging
    cy.url().then(_url => {
        const urlContainsPartnerName :boolean = _url.includes(urlPartnerSlug);
        if (!urlContainsPartnerName) {
            cy.task("log", `~~! EXPECTED URL TO CONTAIN: ${urlPartnerSlug}`);
            cy.task("log", `ACTUAL URL: ${_url}`);
        }

        // cy.wrap(_url).should('contain', urlPartnerSlug);
    })

    if (_returnToOriginalUrl) {
        // Return to the original url to check the other relevant links.
        cy.visit(_targetUrlObject.url);
    }
})

/*
    [ARGS]
    _targetUrlObject   =   A companyUrlObject representing a url and a company name.
                            This URL will be visited and have its application link tested.
                            The test will ensure that clicking the link leads to the application page.

    NOTE:
        undefined is also an expected type for _targetUrlObject.
        This is for the edge case where the array that is invoking this function on its contents
            tries to invoke it on an element that doesn't exist (index out-of-bounds).
*/
Cypress.Commands.add('VerifyApplyButtonWorks', (_targetUrlObject :companyUrlObject|undefined) => {
    if (_targetUrlObject) {
        // Go to the target URL.
        cy.visit(_targetUrlObject.url);

        // Returning false here prevents Cypress from failing the test on uncaught exceptions.
        Cypress.on('uncaught:exception', () => { return false })

        /*
            According to Gabe Tiger, the 'apply-trigger' class is supposed to ONLY be on the links that lead to pages
                with the apply.vouch.us (formerly app.vouch.us) domain.
            If you find that a link has this class and does not lead to that domain, OR a link leads to that domain
                and does not have that class, then it is likely a bug.
        */
        const applyLinkSelector :string = 'a.apply-trigger';

        // Test ALL application buttons
        cy.get(applyLinkSelector)
        .then(($elements :JQuery<HTMLElement>) => {
            const applyLinkCount :number = $elements.length;

            // Log the total number of applicaition links on this page.
            cy.log(`NUMBER OF APPLICATION LINKS: ${applyLinkCount}`);

            for (let i = 0; i < applyLinkCount; i++) {
                // Click the ith application button.
                cy.get(applyLinkSelector)
                .eq(i).click();

                cy.url().then(_url => {
                    const vouchGetStartedUrl :string = 'www.vouch.us/getstarted';
                    const currentlyOnTheGetStartedUrl = _url.includes(vouchGetStartedUrl);

                    if (currentlyOnTheGetStartedUrl) {
                        ///// !START! vouch.us/getstarted edge case !START! /////
                        /*
                            If clicking the application link takes us to the vouch.us/getstarted page,
                                then we must click the application link on that page to finally reach
                                the apply.vouch.us/...
                        */
                        cy.get(applyLinkSelector).then(($elements_getStartedPage :JQuery<HTMLElement>) => {
                            const applyLinkCount_getStartedPage :number = $elements_getStartedPage.length;

                            // Log the total number of applicaition links on the getStarted page.
                            cy.log(`NUMBER OF APPLICATION LINKS (getStarted): ${applyLinkCount_getStartedPage}`);

                            for (let j = 0; j < applyLinkCount; j++) {
                                // Click the ith application button.
                                cy.get(applyLinkSelector)
                                .eq(j).click();

                                cy.ValidateApplicationPage(_targetUrlObject);
                            }
                        })
                        ///// !END!   vouch.us/getstarted edge case   !END! /////
                    } else {
                        const currentlyOnTheDefaultApplyPage = _url === "https://apply.vouch.us/";
                        
                        if (currentlyOnTheDefaultApplyPage) {
                            //testing
                            cy.task("log", "TESTING - TARGET ACQUIRED");
                            
                            // Go back to the previous URL and click the application button again. (Hopefully it works this time.)
                            cy.visit(_targetUrlObject.url);
                            cy.get(applyLinkSelector)
                                .eq(i).click();
                        }

                        cy.ValidateApplicationPage(_targetUrlObject);
                    }
                })
            }
        })
    } else { 
        cy.log(`Url object is undefined.`);
    }
})



