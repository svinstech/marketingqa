import urls from "../configs/url_partner.json";
import arrayShuffle from "array-shuffle";

const baseUrl = Cypress.config('baseUrl')

describe('Test Broken Links', () => {
   
    describe('visits a subset of the partner pages and tests for broken links', () =>{
        const pages = Object.values(urls);
        const shuffledPages = arrayShuffle(pages); // Shuffle to ensure that a different set of links are checked every time.
        const linkSampleSize = 5;

        for (let i = 0; i < linkSampleSize; i++){ // Testing a small number of links to avoid hitting the vouch site hundreds of times.
            let company = `${shuffledPages[i]}`
            company = company.split("/");
            company = company[company.length - 1];
            it("Checking Partner " + company, () => {
                cy.visit(`${baseUrl}/partners/${shuffledPages[i]}`)
                // cy.on('window:confirm', cy.stub().as('confirm'))
                Cypress.on('uncaught:exception', () => {
                    // returning false here prevents Cypress from
                    // failing the test
                    return false
                })
                cy.get('[id=apply-button-test]').click()
                cy.url().should('eq', `https://app.vouch.us/?partner=${company}`)
            })
        }
    })
})