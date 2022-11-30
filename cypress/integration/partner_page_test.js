import urls from "../configs/url_partner.json";
const shuffle = require('shuffle-array');

const baseUrl = Cypress.config('baseUrl')

describe('Test Broken Links', () => {
   
    describe('visits a subset of the partner pages and tests for broken links', () =>{


        //testing
        return false;

        const pages = Object.values(urls);
        const linkSampleSize = 5;
        const pagesSample = shuffle.pick(pages, { 'picks': Math.min(linkSampleSize, pages.length) });

        for (let i = 0; i < linkSampleSize; i++){
            let company = `${pagesSample[i]}`
            company = company.split("/");
            company = company[company.length - 1];
            it("Checking Partner " + company, () => {
                cy.visit(`${baseUrl}/partners/${pagesSample[i]}`)
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