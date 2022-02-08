import urls from "./url_partner.json";

describe('Test Broken Links', () => {
   
    describe('visits all the partner pages and tests for broken links', () =>{

        const pages = Object.values(urls);
        for (let i = 0; i < pages.length; i++){
            let company = `${pages[i]}`
            company = company.split("/");
            company = company[company.length - 1];
            it("Checking Partner " + company, () => {
                cy.visit(`${baseUrl}${pages[i]}`)
                cy.on('window:confirm', cy.stub().as('confirm'))
                Cypress.on('uncaught:exception', (err, runnable) => {
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