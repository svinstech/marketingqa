/*
    NOTE:

    We use cy.wait(1).then(async () => {...} to execute Node code in Cypress contexts.
    This is only done in Before() steps to populate certain variables, like the urlObjects array.
*/
import { onlyOn, skipOn } from '@cypress/skip-test'
const shuffle :any = require('shuffle-array');

const baseUrl :string|null = Cypress.config('baseUrl')

interface companyUrlObject {
    url :string,
    companyName :string
}

// Master array for URL objects.
let urlObjects :companyUrlObject[]; // companyUrlObjects for each relevant URL.

// Subsets of URL objects.
let partnerUrlObjects :companyUrlObject[]; // Subset of just the 'partners' URLs.
let ventureUrlObjects :companyUrlObject[]; // Subset of just the 'venture' URLs.
let ventureStudioUrlObjects :companyUrlObject[]; // Subset of just the 'venture-studio' URLs.

// Sample sizes for each type of URL.
const partnerPageSampleSize :number =  5;
const venturePageSampleSize :number =  5;
const ventureStudioPageSampleSize :number = 4;

// Regex for each type of URL.
const partnerUrlRegex :RegExp = /.+\/partners\/.+/;
const ventureUrlRegex :RegExp = /.+\/venture\/.+/;
const ventureStudioUrlRegex :RegExp = /.+\/venture-studio\/.+/;

// "Apply Now" / "Start Application" button regex.
const applyButtonRegex :RegExp = /.*(apply|start).*(now|application).*/i

/*
    [ARGS]
    _baseUrl    =   The domain to use to retrieve the URLs.

    Returns an array of companyUrlObject if nothing goes wrong with the fetch() request.
    Each companyUrlObject that is returned will have the _baseUrl as the domain.
*/
async function GetUpdatedUrlList(_baseUrl :string|null = "https://www.vouch.us/") :Promise<companyUrlObject[]> {
    let urlList :string[] = [];
    let companyUrlList :companyUrlObject[] = []; // This is what gets returned.

    if (_baseUrl) {
        const xmlUrl :string = `${_baseUrl}/sitemap.xml`;
        const outerRegex :RegExp = /<\/?url>/;
        const urlRegex :RegExp = /^\s*<loc>(.+)<\/loc>\s*$/;
        const whitespaceRegex :RegExp = /^\s*$/;

        // Get the text from the xmlUrl.
        const fetchResponse :Response = await fetch(xmlUrl);
        let fetchResponseText :string = await fetchResponse.text();

        // Remove newline & carriage return characters
        fetchResponseText = fetchResponseText.replace(/\r?\n|\r/g, "");

        // Isolate each URL
        urlList = fetchResponseText.split(outerRegex);

        // Convert the urlList to just a list of the urls. (Removes all other text.)
        const urlListStartingLength :number = urlList.length;
        for (let i :number = urlListStartingLength; i >= 0; i--) {
            const ithItem :string = urlList[i];

            // Remove undefined/emptyString items.
            if (!ithItem) {
                urlList.splice(i,1);
                continue;
            }
            
            if (whitespaceRegex.test(ithItem)) {
                // Remove whitespace elements.
                urlList.splice(i,1);
            } else {
                // Change ithItem to just the URL.
                const regexMatchArray :RegExpMatchArray|null = ithItem.match(urlRegex);

                // Delete items that produce no matches to the urlRegex.
                if (regexMatchArray === null) {
                    urlList.splice(i,1);
                    continue;
                }

                // Overwrite the ith item with its URL.
                const url :string = regexMatchArray[1];
                urlList[i] = url;

                // Populate companyUrlList with companyUrl objects.
                const urlSegmentSplit :string[] = url.split("/");
                const companyName :string = urlSegmentSplit[urlSegmentSplit.length - 1];
                const companyUrlDetails :companyUrlObject = {url, companyName};
                companyUrlList.unshift(companyUrlDetails);
                /*
                    Here we use unshift() instead of push() because we want the 
                    ith item of companyUrl to correspond to the ith item of urlLsit,
                    and this for-loop is iterating through urlList is reverse order.

                    Changing this wont break anything but it may help future people and it doesnt hurt :).
                */
            }
        }

       

    }

    return companyUrlList;
}

/*
    [ARGS]
    targe_targetUrlObjecttUrl   =   A companyUrlObject representing a url and a company name.
                                    This URLs will be visited and have its "Apply Now" / "Start Application" button tested.
                                    The test will ensure that the clicking the button leads to the correct page.

    NOTE:
        undefined is also an expected type for _targetUrlObject.
        This is for the edge case where the the array that is invoking this function on its contents
            tries to invoke it on an element that doesn't exist (index out-of-bounds).
*/
function VerifyApplyButtonWorks(_targetUrlObject :companyUrlObject|undefined) {
    if (_targetUrlObject) {
        // Go to the target URL.
        cy.visit(_targetUrlObject.url);

        // Returning false here prevents Cypress from failing the test on uncaught exceptions.
        Cypress.on('uncaught:exception', () => { return false })

        // Click the application button
        cy.contains('a', applyButtonRegex).click();

        // Ensure that the resulting URL has the correct domain.
        const vouchApplyDomain :string = 'https://app.vouch.us/';
        cy.url().should('contain', vouchApplyDomain);

        // Ensure that the resulting URL has the correct partenr slug.
        cy.url().then(_url => {
            const urlPartnerSlug :string = `partner=${_targetUrlObject.companyName}`;

            // Debugging
            const urlContainsPartnerName :boolean = _url.includes(urlPartnerSlug);
            if (!urlContainsPartnerName) {
                cy.log(`~~! EXPECTED URL TO CONTAIN: ${urlPartnerSlug}`);
                cy.log(`ACTUAL URL: ${_url}`);
            }

            cy.url().should('contain', urlPartnerSlug);
        })
    } else {
        cy.log(`Url object is undefined.`);
        // skipOn(!_targetUrlObject)
    }
}


describe('Check all "Apply Now" / "Start Application" buttons.', () => {
    if (baseUrl) {
        before('Gather URLs', () => {
            cy.wait(1).then(async () => {
                urlObjects = await GetUpdatedUrlList(baseUrl);
                expect(urlObjects.length).to.not.equal(0);
                cy.log(`LINK COUNT: ${urlObjects.length}`);
            });
        })

        describe('Test Partner pages', () => {
            before('Filter URL list to get these URLs: partner, venture, & venture-studio.', () => {
                cy.wait(1).then(() => {
                    partnerUrlObjects = urlObjects.filter((_companyUrlObject) => {return partnerUrlRegex.test(_companyUrlObject.url)});
                    ventureUrlObjects = urlObjects.filter((_companyUrlObject) => {return ventureUrlRegex.test(_companyUrlObject.url)});
                    ventureStudioUrlObjects = urlObjects.filter((_companyUrlObject) => {return ventureStudioUrlRegex.test(_companyUrlObject.url)});

                    //testing
                    cy.log(`partnerUrlObjects.length: ${partnerUrlObjects.length}`);
                    cy.log(`ventureUrlObjects.length: ${ventureUrlObjects.length}`);
                    cy.log(`ventureStudioUrlObjects.length: ${ventureStudioUrlObjects.length}`);

                    partnerUrlObjects = shuffle.pick(partnerUrlObjects, { 'picks': partnerPageSampleSize });
                    ventureUrlObjects = shuffle.pick(ventureUrlObjects, { 'picks': venturePageSampleSize });
                    ventureStudioUrlObjects = shuffle.pick(ventureStudioUrlObjects, { 'picks': ventureStudioPageSampleSize });

                    //testing
                    cy.log(`partnerUrlObjects.length (post shuffle and sample selection): ${partnerUrlObjects.length}`);
                    cy.log(`ventureUrlObjects.length (post shuffle and sample selection): ${ventureUrlObjects.length}`);
                    cy.log(`ventureStudioUrlObjects.length (post shuffle and sample selection): ${ventureStudioUrlObjects.length}`);
                })
                
            })

            // PARTNER page tests.
            for (let i :number = 0; i < partnerPageSampleSize; i++) {
                it(`Checking PARTNER page: ${i}`, () => {
                    const urlObject :companyUrlObject = partnerUrlObjects[i];

                    if (urlObject) {
                        cy.log(`PARTNER NAME: ${urlObject.companyName}`);
                    }

                    VerifyApplyButtonWorks(urlObject);
                })
            }

            // VENTURE page tests.
            for (let i :number = 0; i < venturePageSampleSize; i++) {
                it(`Checking VENTURE page: ${i}`, () => {
                    const urlObject :companyUrlObject = ventureUrlObjects[i];

                    if (urlObject) {
                        cy.log(`VENTURE NAME: ${urlObject.companyName}`);
                    }

                    VerifyApplyButtonWorks(urlObject);
                })
            }

            // VENTURE-STUDIO page tests.
            for (let i :number = 0; i < ventureStudioPageSampleSize; i++) {
                it(`Checking VENTURE-STUDIO page: ${i}`, () => {
                    const urlObject :companyUrlObject = ventureStudioUrlObjects[i];

                    if (urlObject) {
                        cy.log(`VENTURE-STUDIO NAME: ${urlObject.companyName}`);
                    }

                    VerifyApplyButtonWorks(urlObject);
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