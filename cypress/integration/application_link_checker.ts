/*
    NOTE:

    We use cy.wait(1).then(async () => {...} to execute Node code within Cypress contexts.
    This is only done in Before() steps to populate certain variables (for example, the urlObjects array).
*/
import premierPartnerPages from "../configs/url_premier_partner.json";
const shuffle :any = require('shuffle-array');
const baseUrl :string|null = Cypress.config('baseUrl')
import { GetUpdatedUrlList } from "../functions/link_checker_functions";
import { companyUrlObject } from "../interfaces/link_checker_interfaces"

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

///////////////////////
//////// TESTS ////////
///////////////////////
describe('Check all application links.', () => {
    if (baseUrl) {
        before('Gather URLs', () => {
            cy.wait(1).then(async () => {
                urlObjects = await GetUpdatedUrlList(baseUrl);
                expect(urlObjects.length).to.not.equal(0); // fails here
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
        describe("PARTNER page tests", () => {
            let testType = "PARTNER"
            for (let i :number = 0; i < partnerPageSampleSize; i++) {
                it(`Checking ${testType} page: ${i}`, () => {
                    const urlObject :companyUrlObject = partnerUrlObjects[i];

                    if (urlObject) {
                        cy.log(`${testType} NAME: ${urlObject.companyName}`);
                    }

                    cy.VerifyApplyButtonWorks(urlObject);
                })
            }
        })

        // VENTURE page tests.
        describe("VENTURE page tests", { tags : ['@tagExample']}, () => {
            let testType = "VENTURE"
            for (let i :number = 0; i < venturePageSampleSize; i++) {
                it(`Checking ${testType} page: ${i}`, () => {
                    const urlObject :companyUrlObject = ventureUrlObjects[i];

                    if (urlObject) {
                        cy.log(`${testType} NAME: ${urlObject.companyName}`);
                    }

                    cy.VerifyApplyButtonWorks(urlObject);
                })
            }
        })

        // VENTURE-STUDIO page tests.
        describe("VENTURE-STUDIO page tests", () => {
            let testType = "VENTURE-STUDIO"
            for (let i :number = 0; i < ventureStudioPageSampleSize; i++) {
                it(`Checking ${testType} page: ${i}`, () => {
                    const urlObject :companyUrlObject = ventureStudioUrlObjects[i];

                    if (urlObject) {
                        cy.log(`${testType} NAME: ${urlObject.companyName}`);
                    }

                    cy.VerifyApplyButtonWorks(urlObject);
                })
            }
        })

        // PREMIER PARTNER page tests.
        describe("PREMIER PARTNER page tests", () => {
            let testType = "PREMIER PARTNER"
            for (let i :number = 0; i < premierPartnerSampleSize; i++) {
                it(`Checking ${testType} page: ${i}`, () => {
                    const urlObject :companyUrlObject = premierPartnerUrlObjects[i];

                    if (urlObject) {
                        cy.log(`${testType} URL: ${urlObject.url}`);
                    }

                    cy.VerifyApplyButtonWorks(urlObject);
                })
            }
        })
    } else {
        cy.log("ERROR - baseUrl not defined.");
        // skipOn(!_targetUrlObject)
    }
})

// Necessary for top-level awaits to be allowed.
export{}