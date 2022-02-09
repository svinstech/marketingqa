import urls from "../configs/url_partner.json";

const baseUrl = Cypress.config('baseUrl')

describe('Test Broken Links', () => {
   
    describe('visits all the partner pages and tests for broken links', () =>{

        const pages = Object.values(urls);
        for (let i = 0; i < pages.length; i++){
            let company = `${pages[i]}`
            company = company.split("/");
            company = company[company.length - 1];
            it("Checking Partner " + company, () => {
                cy.visit(`${baseUrl}/partners/${pages[i]}`)
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