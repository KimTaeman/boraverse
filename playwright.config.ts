import { defineConfig, devices } from "@playwright/test";
export default defineConfig({
  testDir: "./e2e",
  use: { baseURL: "http://127.0.0.1:3456", ...devices["Desktop Chrome"] },
  webServer: { command: "npm run dev -- --hostname 127.0.0.1 --port 3456", env: { NEXT_E2E: "1" }, url: "http://127.0.0.1:3456", reuseExistingServer: false, timeout: 120000 },
});
