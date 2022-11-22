import urls from "../configs/url.json";
import arrayShuffle from "array-shuffle";

const baseUrl = Cypress.config('baseUrl');

describe('Test Broken Links', () => {
    describe('visits a subset of the vouch static pages and tests for broken links', () => {
        const pages = Object.values(urls);
        const shuffledPages = arrayShuffle(pages); // Shuffle to ensure that a different set of links are checked every time.
        const linkSampleSize = 5;

        for (let i = 0; i < linkSampleSize; i++){ // Testing a small number of links to avoid hitting the vouch site hundreds of times.
            const url = `${baseUrl}${shuffledPages[i]}`
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