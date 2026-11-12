import { defineConfig, devices } from "@playwright/test";
export default defineConfig({
  testDir: "./e2e",
  testIgnore: "ocean-api-boundary.spec.ts",
  use: { baseURL: "http://127.0.0.1:3456", ...devices["Desktop Chrome"] },
  webServer: { command: "npm run dev -- --hostname 127.0.0.1 --port 3456", env: { NEXT_E2E: "1", OCEAN_WRITE_ENABLED: "false" }, url: "http://127.0.0.1:3456", reuseExistingServer: false, timeout: 120000 },
});
