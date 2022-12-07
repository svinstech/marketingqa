import urls from "../configs/url_partner.json";
const shuffle :any = require('shuffle-array');

const baseUrl :string|null = Cypress.config('baseUrl')

describe('Test Broken Links', () => {
   
    describe('visits a subset of the partner pages and tests for broken links', () =>{
        const pages :string[] = Object.values(urls);
        const linkSampleSize :number = 5;
        const pagesSample :string[] = shuffle.pick(pages, { 'picks': Math.min(linkSampleSize, pages.length) });

        for (let i = 0; i < linkSampleSize; i++){
            const companyUrlSegment :string = `${pagesSample[i]}`
            const companyUrlSegmentSplit :string[] = companyUrlSegment.split("/"); // ["", "companyUrlWithoutSlash"]
            const companyUrlWithoutSlash :string = companyUrlSegmentSplit[companyUrlSegmentSplit.length - 1];

            it("Checking Partner " + companyUrlWithoutSlash, () => {
                cy.visit(`${baseUrl}/partners/${pagesSample[i]}`)
                // cy.on('window:confirm', cy.stub().as('confirm'))
                Cypress.on('uncaught:exception', () => {
                    // returning false here prevents Cypress from
                    // failing the test
                    return false
                })
                cy.get('[id=apply-button-test]').click()
                cy.url().should('eq', `https://app.vouch.us/?partner=${companyUrlWithoutSlash}`)
            })
        }
    })
})