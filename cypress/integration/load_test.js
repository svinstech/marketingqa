import urls from "../configs/url.json";
const baseUrl = Cypress.config('baseUrl')

/*
Tests out all the vouch pages listed in url.json.
*/

describe('Test Broken Links', () => {
    describe('visits all the vouch static pages and tests for broken links', () => {
        const pages = Object.values(urls);
        for (let i = 0; i < 3/*pages.length*/; i++){ // Testing a small number of links to avoid hitting the vouch site hundreds of times.
            const url = `${baseUrl}${pages[i]}`
            it("Checking " + url, () => {
                cy.visit(url)
                // cy.on('window:confirm', cy.stub().as('confirm'))
                Cypress.on('uncaught:exception', () => {
                    // returning false here prevents Cypress from
                    // failing the test
                    return false
                })

                cy.wrap('passed').as('ctrl') // Question from Kellen - What is happening here?
                cy.get("a:not([href*='mailto:]'])").each($el => {
                    if ($el.prop('href').length > 0) {
                        const message = $el.text()
                        expect($el, message).to.have.attr("href").not.contain("undefined")
                    }
                })
            })
        }
    })
})