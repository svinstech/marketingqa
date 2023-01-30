// import urls from "../configs/url.json";
// const shuffle :any = require('shuffle-array');

// const baseUrl :string|null = Cypress.config('baseUrl');

// describe('Test Broken Links', () => {
//     describe('visits a subset of the vouch static pages and tests for broken links', () => {
//         const pages :string[] = Object.values(urls);
//         const linkSampleSize :number =  Math.min(5, pages.length);

//         let pagesSample :string[]|string = shuffle.pick(pages, { 'picks': linkSampleSize });

//         /* 
//             If shuffle.pick() picks a size of 1, then it will NOT return an array. But we still want an array.
//             So here we ensure that pagesSample is always an array.
//         */
//         if (!Array.isArray(pagesSample)) {
//             pagesSample = [pagesSample];
//         }
        
//         for (let i = 0; i < linkSampleSize; i++){
//             const url :string = `${baseUrl}${pagesSample[i]}`
//             it("Checking " + url, () => {
//                 cy.visit(url)
//                 // cy.on('window:confirm', cy.stub().as('confirm'))
//                 Cypress.on('uncaught:exception', () => {
//                     // returning false here prevents Cypress from
//                     // failing the test
//                     return false
//                 })

//                 cy.wrap('passed').as('ctrl') // Question from Kellen - What is happening here?
//                 cy.get("a:not([href*='mailto:]'])").each($el => {
//                     if ($el.prop('href').length > 0) {
//                         const message :string = $el.text()
//                         expect($el, message).to.have.attr("href").not.contain("undefined")
//                     }
//                 })
//             })
//         }
//     })
// })