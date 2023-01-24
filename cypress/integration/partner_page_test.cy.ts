// // import urls from "../configs/url_partner.json";
// const shuffle :any = require('shuffle-array');

// const baseUrl :string|null = Cypress.config('baseUrl')

// describe('Test Broken Links', () => {
   
//     describe('visits a subset of the partner pages and tests for broken links', () =>{
//         const pages :string[] = Object.values(urls);
//         const linkSampleSize :number =  0//Math.min(5, pages.length); // 0 until the partner page slugs are fixed.

//         let pagesSample :string[]|string = shuffle.pick(pages, { 'picks': linkSampleSize });

//         /* 
//             If shuffle.pick() picks a size of 1, then it will NOT return an array. But we still want an array.
//             So here we ensure that pagesSample is always an array.
//         */
//         if (!Array.isArray(pagesSample)) {
//             pagesSample = [pagesSample];
//         }
//         for (let i = 0; i < linkSampleSize; i++){
//             const companyUrlSegment :string = `${pagesSample[i]}`
//             const companyUrlSegmentSplit :string[] = companyUrlSegment.split("/"); // ["", "companyUrlWithoutSlash"]
//             const companyUrlWithoutSlash :string = companyUrlSegmentSplit[companyUrlSegmentSplit.length - 1];

//             it("Checking Partner " + companyUrlWithoutSlash, () => {
//                 cy.visit(`${baseUrl}/partners/${companyUrlWithoutSlash}`)

//                 // cy.on('window:confirm', cy.stub().as('confirm'))
//                 Cypress.on('uncaught:exception', () => {
//                     // returning false here prevents Cypress from
//                     // failing the test
//                     return false
//                 })
//                 cy.get('[id=apply-button-test]').click()
//                 cy.url().should('contain', 'https://app.vouch.us/');
//                 cy.url().should('contain', `partner=${companyUrlWithoutSlash}`);
//             })
//         }
//     })
// })