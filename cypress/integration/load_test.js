import urls from "./url.json";

describe("Test Broken Links", () => {
  it("visits all the pages and tests for broken links", () => {
    const pages = Object.values(urls);
    for (let i = 0; i < pages.length; i++) {
      cy.visit(`${pages[i]}`);

      cy.wrap("passed").as("ctrl");
      cy.get("a:not([href*='mailto:]']").each(($el) => {
        if ($el.prop("href").length > 0) {
          const message = $el.text();
          expect($el, message).to.have.attr("href").not.contain("undefined");
          cy.log($el.attr("href"));
        }
      });
    }
  });
});
