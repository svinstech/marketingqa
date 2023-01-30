// import { defineConfig } from "cypress";

"use strict";
module.exports = {
    projectId: 'gwph8y',
    // type: 'module',
    waitForAnimations: true,
    watchForFileChanges: false,
    chromeWebSecurity: false,
    defaultCommandTimeout: 60000,
    e2e: {
        setupNodeEvents(on:any, config:any) {
            return require('./cypress/plugins/index.ts')(on, config);
        },
        specPattern: './cypress/integration//**/*.{js,jsx,ts,tsx}',
        baseUrl: 'https://www.vouch.us/',
    },
};
