
const shuffle :any = require('shuffle-array');
// import shuffle from 'shuffle-array'

const baseUrl :string|null = Cypress.config('baseUrl')


let urls :string[]; // All urls
let partnerUrls :string[]; // Subset of just the 'partners' urls.
let ventureUrls :string[]; // Subset of just the 'venture' urls.
let targetUrls :string[]; // Update this with each test. This will contain all the urls for that particular test.
let companyUrlSegmentSplit :string[];
let companyUrlWithoutSlash :string;

const linkSampleSize :number =  1//Math.min(5, pages.length); // 0 until the partner page slugs are fixed.
const partnerUrlRegex :RegExp = /.+\/partners\/.+/;
const ventureUrlRegex :RegExp = /.+\/venture\/.+/;

/*
    Returns an array of urls as strings if nothing goes wrong with the fetch() request.

    The urls returned are those of the https://www.vouch.us domain.
*/
async function GetUpdatedUrlList(_baseUrl :string|null = "https://www.vouch.us/") :Promise<string[]> {
    let urlList :string[] = [];

    if (_baseUrl) {
        const xmlUrl :string = `${_baseUrl}/sitemap.xml`;
        const outerRegex :RegExp = /<\/?url>/;
        const urlRegex :RegExp = /^\s*<loc>(.+)<\/loc>\s*$/;
        const whitespaceRegex :RegExp = /^\s*$/;

        // Get the text from the xmlUrl.
        const fetchResponse = await fetch(xmlUrl);
        let fetchResponseText = await fetchResponse.text();

        // Remove newline & carriage return characters
        fetchResponseText = fetchResponseText.replace(/\r?\n|\r/g, "");

        // Isolate each url
        urlList = fetchResponseText.split(outerRegex);

        // Convert the urlList to just a list of the urls. (Removes all other text.)
        const urlListStartingLength :number = urlList.length;
        for (let i = urlListStartingLength; i >= 0; i--) {
            const ithItem = urlList[i];

            // Remove undefined/emptyString items.
            if (!ithItem) {
                urlList.splice(i,1);
                continue;
            }
            
            if (whitespaceRegex.test(ithItem)) {
                // Remove whitespace elements.
                urlList.splice(i,1);
            } else {
                // Change ithItem to just the url.
                const regexMatchArray :RegExpMatchArray|null = ithItem.match(urlRegex);

                // Delete items that produce no matches to the urlRegex.
                if (regexMatchArray === null) {
                    urlList.splice(i,1);
                    continue;
                }

                // Overwrite the ith item with the url that it contains.
                const url = regexMatchArray[1];
                urlList[i] = url;
            }
        }
    }

    return urlList;
}

/**/
function VerifyApplyButtonWorks(urlList :string[], index :number) {
    cy.wait(1).then(() => {
        companyUrlSegmentSplit = targetUrls[i].split("/");
        companyUrlWithoutSlash = companyUrlSegmentSplit[companyUrlSegmentSplit.length - 1]
    })

    cy.visit(urlList[index]);

    Cypress.on('uncaught:exception', () => {
        // returning false here prevents Cypress from
        // failing the test
        return false
    })

    cy.contains('a', /.*(apply|start).*(now|application).*/i).click();

    const vouchApplyDomain = 'https://app.vouch.us/';

    cy.url().should('contain', vouchApplyDomain);

    cy.url().then(_url => {
        const urlPartnerSlug = `partner=${companyUrlWithoutSlash}`;

        // Debugging
        const urlContainsPartnerName = _url.includes(urlPartnerSlug);
        if (!urlContainsPartnerName) {
            cy.log(`~~! EXPECTED URL TO CONTAIN: ${urlPartnerSlug}`);
            cy.log(`ACTUAL URL: ${_url}`);
        }

        cy.url().should('contain', urlPartnerSlug);
    })
}

// urls = await GetUpdatedUrlList();



describe('Check all "Apply Now" buttons.', () => {
    if (baseUrl) {
        before('Ensure that URLs were gathered', () => {
            cy.wait(1).then(async () => {
                urls = await GetUpdatedUrlList(baseUrl);
                expect(urls.length).to.not.equal(0);
                cy.log(`LINK COUNT: ${urls.length}`);
            });
        })

        describe('Test Partner pages', () => {
            before('Filter url list to get partner & venture pages.', () => {
                cy.wait(1).then(async() => {
                    partnerUrls = urls.filter((_url) => {return partnerUrlRegex.test(_url)});
                    ventureUrls = urls.filter((_url) => {return ventureUrlRegex.test(_url)});
                    targetUrls = partnerUrls.concat(ventureUrls);

                    //testing
                    cy.log(`partnerUrls.length: ${partnerUrls.length}`);
                    cy.log(`ventureUrls.length: ${ventureUrls.length}`);
                    cy.log(`targetUrls.length: ${targetUrls.length}`);
                })
                
            })

            for (let i = 0; i < 10/*linkSampleSize*/; i++) {
                it("Checking partner page page " + i/*companyUrlWithoutSlash*/, () => {
                    VerifyApplyButtonWorks(partnerUrls, i);
                })

                it("Checking venture page page " + i/*companyUrlWithoutSlash*/, () => {
                    VerifyApplyButtonWorks(ventureUrls, i);
                })
            }
        })
    }

})


// console.log(textOnPage.length)

// describe('Test Broken Links', () => {
//     before('Get updated links', () => {
//         let textOnPage :string = "";
//         fetch(xmlUrl).then((response) => console.log(response))

//         //testing
//         console.log(textOnPage);
//     })

    // describe('visits a subset of the partner pages and tests for broken links', () =>{
    //     const pages :string[] = Object.values(urls);
    //     const linkSampleSize :number =  10//Math.min(5, pages.length); // 0 until the partner page slugs are fixed.

    //     let pagesSample :string[]|string = shuffle.pick(pages, { 'picks': linkSampleSize });

    //     /* 
    //         If shuffle.pick() picks a size of 1, then it will NOT return an array. But we still want an array.
    //         So here we ensure that pagesSample is always an array.
    //     */
    //     if (!Array.isArray(pagesSample)) {
    //         pagesSample = [pagesSample];
    //     }
    //     for (let i = 0; i < linkSampleSize; i++){
    //         const companyUrlSegment :string = `${pagesSample[i]}`
    //         const companyUrlSegmentSplit :string[] = companyUrlSegment.split("/"); // ["", "companyUrlWithoutSlash"]
    //         const companyUrlWithoutSlash :string = companyUrlSegmentSplit[companyUrlSegmentSplit.length - 1];

    //         it("Checking Partner " + companyUrlWithoutSlash, () => {
    //             cy.visit(`${baseUrl}/partners/${companyUrlWithoutSlash}`)

    //             // cy.on('window:confirm', cy.stub().as('confirm'))
    //             Cypress.on('uncaught:exception', () => {
    //                 // returning false here prevents Cypress from
    //                 // failing the test
    //                 return false
    //             })
    //             cy.get('[id=apply-button-test]').click()
    //             cy.url().should('contain', 'https://app.vouch.us/');
    //             cy.url().should('contain', `partner=${companyUrlWithoutSlash}`);
    //         })
    //     }
    // })
// })

// Necessary for top-level awaits to be allowed.
export{}