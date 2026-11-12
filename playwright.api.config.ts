import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "./e2e",
  testMatch: "ocean-api-boundary.spec.ts",
  use: { baseURL: "http://127.0.0.1:3457" },
  webServer: {
    command: "npm run dev -- --hostname 127.0.0.1 --port 3457",
    env: { NEXT_E2E: "1", OCEAN_WRITE_ENABLED: "true", DATABASE_URL: "postgresql://invalid:invalid@127.0.0.1:1/invalid", DATABASE_CA_CERT_PATH: "", OCEAN_HMAC_SECRET: "integration-test-secret-not-for-production" },
    url: "http://127.0.0.1:3457", reuseExistingServer: false, timeout: 120000,
  },
});
