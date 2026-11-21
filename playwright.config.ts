import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "./tests/browser", workers: 1, timeout: 90000,
  use: { baseURL: "http://127.0.0.1:3100", channel: "chrome", launchOptions: {args:["--enable-webgl","--ignore-gpu-blocklist","--enable-unsafe-swiftshader"]} },
  webServer: {command: "npm run start", url: "http://127.0.0.1:3100", reuseExistingServer: true, timeout: 120000},
});
