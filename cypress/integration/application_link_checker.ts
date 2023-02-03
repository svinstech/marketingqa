/*
    NOTE:

    We use cy.wait(1).then(async () => {...} to execute Node code within Cypress contexts.
    This is only done in Before() steps to populate certain variables (for example, the urlObjects array).
*/
import { skipOn } from '@cypress/skip-test'
import premierPartnerPages from "../configs/url_premier_partner.json";
const shuffle :any = require('shuffle-array');
const baseUrl :string|null = Cypress.config('baseUrl')
import { companyUrlObject, GetUpdatedUrlList } from "../functions/link_checker_functions";


// Master array for URL objects.
let urlObjects :companyUrlObject[]; // companyUrlObjects for each relevant URL.

// Subsets of URL objects.
let partnerUrlObjects :companyUrlObject[]; // Subset of just the 'partners' URLs.
let ventureUrlObjects :companyUrlObject[]; // Subset of just the 'venture' URLs.
let ventureStudioUrlObjects :companyUrlObject[]; // Subset of just the 'venture-studio' URLs.
let premierPartnerUrlObjects :companyUrlObject[] = []; // Subset of just the premier partner URLs.

// Sample sizes for each type of URL.
const partnerPageSampleSize :number =  5;
const venturePageSampleSize :number =  5;
const ventureStudioPageSampleSize :number = 4; // As of 1/30/2023, there are only 4.
const premierPartnerSampleSize :number = 16; // Test all of them since they're all unique and there aren't that many.

// Regex for each type of URL.
const partnerUrlRegex :RegExp = /.+\/partners\/.+/;
const ventureUrlRegex :RegExp = /.+\/venture\/.+/;
const ventureStudioUrlRegex :RegExp = /.+\/venture-studio\/.+/;

// Populate premierPartnerUrlObjects
const premierPartnerPagesKeys :string[] = Object.keys(premierPartnerPages);
const premierPartnerPagesValues :string[] = Object.values(premierPartnerPages);
for (let i :number = 0; i < premierPartnerPagesKeys.length; i++) {
    const companyName = premierPartnerPagesValues[i];
    const companyUrl = `${baseUrl}${premierPartnerPagesKeys[i]}`

    const companyDetails :companyUrlObject = {
        url:companyUrl,
        companyName:companyName
    }

    premierPartnerUrlObjects.push(companyDetails);
}



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
// function VerifyApplyButtonWorks(_targetUrlObject :companyUrlObject|undefined) {
//     if (_targetUrlObject) {
//         // Go to the target URL.
//         cy.visit(_targetUrlObject.url);

//         // Returning false here prevents Cypress from failing the test on uncaught exceptions.
//         Cypress.on('uncaught:exception', () => { return false })

//         /*
//             According to Gabe Tiger, the 'apply-trigger' class is supposed to ONLY be on the links that lead to pages
//                 with the app.vouch.us domain.
//             If you find that a link has this class and does not lead to that domain, it is likely a bug.
//         */
//         const applyLinkSelector :string = 'a.apply-trigger';

//         // Test ALL application buttons
//         cy.get(applyLinkSelector)
//         .then(($elements :JQuery<HTMLElement>) => {
//             const applyLinkCount :number = $elements.length;

//             // Log the total number of applicaition links on this page.
//             cy.log(`NUMBER OF APPLICATION LINKS: ${applyLinkCount}`);

//             for (let i = 0; i < applyLinkCount; i++) {
//                 // Click the ith application button.
//                 /*
//                     NOTE:
//                         Here, we do the exact same filtering as above because when we navigate away
//                         from this page, the connection to all DOM elements on the page that we left
//                         is gone.
//                 */
//                 cy.get(applyLinkSelector)
//                 .eq(i).click();

//                 cy.url().then(_url => {
//                     const vouchGetStartedUrl :string = 'www.vouch.us/getstarted';
//                     const currentlyOnTheGetStartedUrl = _url.includes(vouchGetStartedUrl);


//                     if (currentlyOnTheGetStartedUrl) {
//                         ///// !START! vouch.us/getstarted edge case !START! /////
//                         /*
//                             If clicking the application link takes us to the vouch.us/getstarted page,
//                                 then we must click the application link on that page to finally reach
//                                 the app.vouch.us/...
//                         */
//                         cy.get(applyLinkSelector).then(($elements_getStartedPage :JQuery<HTMLElement>) => {
//                             const applyLinkCount_getStartedPage :number = $elements_getStartedPage.length;

//                             // Log the total number of applicaition links on the getStarted page.
//                             cy.log(`NUMBER OF APPLICATION LINKS (getStarted): ${applyLinkCount_getStartedPage}`);

//                             for (let j = 0; j < applyLinkCount; j++) {
//                                 // Click the ith application button.
//                                 cy.get(applyLinkSelector)
//                                 .eq(j).click();

//                                 ValidateApplicationPage(_targetUrlObject);
//                             }
//                         })
//                         ///// !END!   vouch.us/getstarted edge case   !END! /////
//                     } else {
//                         ValidateApplicationPage(_targetUrlObject);
//                     }
//                 })
//             }
//         })
//     } else { 
//         cy.log(`Url object is undefined.`);
//         // skipOn(!_targetUrlObject)
//     }
// }

/*
    [ARGS]
    _targetUrlObject        =   A companyUrlObject representing a url and a company name.
    _returnToOriginalUrl    =   Optional boolean. Defaults to true.
                                 If true, then it will go to the URL of _targetUrlObject at the end of the function.
*/
// function ValidateApplicationPage(_targetUrlObject :companyUrlObject, _returnToOriginalUrl :boolean = true) {
//     // Ensure that the resulting URL has the correct domain.
//     const vouchApplyDomain :string = 'https://app.vouch.us/';
//     cy.url().should('contain', vouchApplyDomain);

//     // Ensure that the resulting URL has the correct partenr slug.
//     cy.url().then(_url => {
//         const urlPartnerSlug :string = `partner=${_targetUrlObject.companyName}`;

//         // Debugging
//         const urlContainsPartnerName :boolean = _url.includes(urlPartnerSlug);
//         if (!urlContainsPartnerName) {
//             cy.log(`~~! EXPECTED URL TO CONTAIN: ${urlPartnerSlug}`);
//             cy.log(`ACTUAL URL: ${_url}`);
//         }

//         cy.wrap(_url).should('contain', urlPartnerSlug);
//     })

//     if (_returnToOriginalUrl) {
//         // Return to the original url to check the other relevant links.
//         cy.visit(_targetUrlObject.url);
//     }
// }


describe('Check all application links.', () => {
    if (baseUrl) {
        before('Gather URLs', () => {
            cy.wait(1).then(async () => {
                urlObjects = await GetUpdatedUrlList(baseUrl);
                expect(urlObjects.length).to.not.equal(0);
                cy.log(`LINK COUNT: ${urlObjects.length}`);
            });
        })

        before('Filter URL list to get these URLs: partner, venture, & venture-studio.', () => {
            cy.wait(1).then(() => {
                partnerUrlObjects = urlObjects.filter((_companyUrlObject) => {return partnerUrlRegex.test(_companyUrlObject.url)});
                ventureUrlObjects = urlObjects.filter((_companyUrlObject) => {return ventureUrlRegex.test(_companyUrlObject.url)});
                ventureStudioUrlObjects = urlObjects.filter((_companyUrlObject) => {return ventureStudioUrlRegex.test(_companyUrlObject.url)});

                //debugging
                cy.log(`partnerUrlObjects.length: ${partnerUrlObjects.length}`);
                cy.log(`ventureUrlObjects.length: ${ventureUrlObjects.length}`);
                cy.log(`ventureStudioUrlObjects.length: ${ventureStudioUrlObjects.length}`);
                cy.log(`premierPartnerUrlObjects.length: ${premierPartnerUrlObjects.length}`);

                partnerUrlObjects = shuffle.pick(partnerUrlObjects, { 'picks': partnerPageSampleSize });
                ventureUrlObjects = shuffle.pick(ventureUrlObjects, { 'picks': venturePageSampleSize });
                ventureStudioUrlObjects = shuffle.pick(ventureStudioUrlObjects, { 'picks': ventureStudioPageSampleSize });
                premierPartnerUrlObjects = shuffle.pick(premierPartnerUrlObjects, { 'picks': premierPartnerSampleSize });

                //debugging
                cy.log(`partnerUrlObjects.length (post shuffle and sample selection): ${partnerUrlObjects.length}`);
                cy.log(`ventureUrlObjects.length (post shuffle and sample selection): ${ventureUrlObjects.length}`);
                cy.log(`ventureStudioUrlObjects.length (post shuffle and sample selection): ${ventureStudioUrlObjects.length}`);
                cy.log(`premierPartnerUrlObjects.length (post shuffle and sample selection): ${premierPartnerUrlObjects.length}`);
            })
            
        })

        // PARTNER page tests.
        let testType = "PARTNER";
        for (let i :number = 0; i < partnerPageSampleSize; i++) {
            it(`Checking ${testType} page: ${i}`, () => {
                const urlObject :companyUrlObject = partnerUrlObjects[i];

                if (urlObject) {
                    cy.log(`${testType} NAME: ${urlObject.companyName}`);
                }

                cy.VerifyApplyButtonWorks(urlObject);
            })
        }

        // VENTURE page tests.
        testType = "VENTURE"
        for (let i :number = 0; i < venturePageSampleSize; i++) {
            it(`Checking ${testType} page: ${i}`, () => {
                const urlObject :companyUrlObject = ventureUrlObjects[i];

                if (urlObject) {
                    cy.log(`${testType} NAME: ${urlObject.companyName}`);
                }

                cy.VerifyApplyButtonWorks(urlObject);
            })
        }

        // VENTURE-STUDIO page tests.
        testType = "VENTURE-STUDIO"
        for (let i :number = 0; i < ventureStudioPageSampleSize; i++) {
            it(`Checking ${testType} page: ${i}`, () => {
                const urlObject :companyUrlObject = ventureStudioUrlObjects[i];

                if (urlObject) {
                    cy.log(`${testType} NAME: ${urlObject.companyName}`);
                }

                cy.VerifyApplyButtonWorks(urlObject);
            })
        }

        // PREMIER PARTNER page tests.
        testType = "PREMIER PARTNER"
        for (let i :number = 0; i < premierPartnerSampleSize; i++) {
            it(`Checking ${testType} page: ${i}`, () => {
                const urlObject :companyUrlObject = premierPartnerUrlObjects[i];

                if (urlObject) {
                    cy.log(`${testType} URL: ${urlObject.url}`);
                }

                cy.VerifyApplyButtonWorks(urlObject);
            })
        }
    } else {
        cy.log("ERROR - baseUrl not defined.");
        // skipOn(!_targetUrlObject)
    }
})

// Necessary for top-level awaits to be allowed.
export{}