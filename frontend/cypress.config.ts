/// <reference types="vite/client" />

import { defineConfig } from "cypress";

const baseUrl = process.env.CYPRESS_BASE_URL || "";
const apiUrl = process.env.CYPRESS_API_URL || "";

export default defineConfig({
  e2e: {
    baseUrl,
    specPattern: "cypress/e2e/**/*.cy.{ts,tsx,js,jsx}",
    supportFile: "cypress/support/e2e.ts",
    screenshotsFolder: "cypress/screenshots",
    videosFolder: "cypress/videos",
    video: true,
    chromeWebSecurity: false,
    env: {
      apiUrl,
    },
    setupNodeEvents(_on, config) {
      return config;
    },
  },
  viewportWidth: 1366,
  viewportHeight: 768,
  retries: {
    runMode: 2,
    openMode: 0,
  },
});
