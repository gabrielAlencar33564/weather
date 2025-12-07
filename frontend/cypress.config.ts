/// <reference types="vite/client" />

import { defineConfig } from "cypress";
import * as dotenv from "dotenv";

dotenv.config();

const baseUrl = process.env.FRONTEND_ORIGIN || "";
const apiUrl = process.env.API_URL_PUBLIC || "";

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
