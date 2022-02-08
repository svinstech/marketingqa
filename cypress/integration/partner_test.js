import urls from "./url_partner.json";

describe("Test Broken Links", () => {
  it("visits all the pages and tests for broken links", () => {
    const pages = Object.values(urls);
    for (let i = 0; i < pages.length; i++) {
      let company = `${pages[i]}`;
      company = company.split("/");
      company = company[company.length - 1];
      cy.log(company);

      cy.visit(`${pages[i]}`);

      cy.get("[id=apply-button-test]").click();
      cy.url().should("eq", `https://app.vouch.us/?partner=${company}`);
    }
  });
});
