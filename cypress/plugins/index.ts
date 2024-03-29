/// <reference types="@cypress/grep" />
// ***********************************************************
// This example plugins/index.js can be used to load plugins
//
// You can change the location of this file or turn off loading
// the plugins file with the 'pluginsFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/plugins-guide
// ***********************************************************

// This function is called when a project is opened or re-opened (e.g. due to
// the project's config changing)

/**
 * @type {Cypress.PluginConfig}
 */
// eslint-disable-next-line no-unused-vars
module.exports = (on:any, config:any) => {
  // `on` is used to hook into various events Cypress emits
  // `config` is the resolved Cypress config
  on('task', {
    log(message:string) {
      console.log(message)
      return null
    },
  })

  return require('@cypress/grep/src/plugin')(config);
}

const companyUrlObject = require("../interfaces/link_checker_interfaces");

declare namespace Cypress {
  interface Chainable<Subject = any> {
      VerifyApplyButtonWorks(_targetUrlObject :typeof companyUrlObject|undefined): void
      ValidateApplicationPage(_targetUrlObject :typeof companyUrlObject, _returnToOriginalUrl? :boolean): void
  }
}
