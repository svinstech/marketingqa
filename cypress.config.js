"use strict";
module.exports = {
    projectId: 'gwph8y',
    waitForAnimations: true,
    watchForFileChanges: false,
    chromeWebSecurity: false,
    defaultCommandTimeout: 60000,
    e2e: {
        setupNodeEvents(on, config) {
            return require('./cypress/plugins/index.js')(on, config);
        },
        specPattern: './cypress/integration//**/*.{js,jsx,ts,tsx}',
        baseUrl: 'https://www.vouch.us',
    },
};
