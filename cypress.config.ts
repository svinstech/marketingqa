module.exports = {
  projectId: 'gwph8y',
  waitForAnimations: true,
  watchForFileChanges: false,
  chromeWebSecurity: false,
  defaultCommandTimeout: 60000,
  e2e: {
    // We've imported your old cypress plugins here.
    // You may want to clean this up later by importing these.
    setupNodeEvents(on:any, config:any) {
      return require('./cypress/plugins/index.js')(on, config)
    },
    specPattern: './cypress/integration//**/*.{js,jsx,ts,tsx}',
    baseUrl: 'https://www.vouch.us',
  },
}
