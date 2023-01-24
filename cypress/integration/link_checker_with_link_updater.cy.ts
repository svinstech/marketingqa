
// const shuffle :any = require('shuffle-array');
import shuffle from 'shuffle-array'

// const baseUrl :string|null = Cypress.config('baseUrl')


let urls :string[]|null;

/*
    Returns an array of urls as strings if nothing goes wrong with the fetch() request.
    Otherwise, returns null.

    The urls returned are those of the https://www.vouch.us domain.
*/
async function GetUpdatedUrlList(_baseUrl = "https://www.vouch.us") :Promise<string[]|null> {
    let urlList :string[]|null = null;

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

    return urlList;
}

urls = await GetUpdatedUrlList();

describe('Check all "Apply Now" buttons.', () => {
    before('Ensure that URLs were gathered', () => {
        expect(urls).to.not.equal(null);
    })
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