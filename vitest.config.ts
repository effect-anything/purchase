import { defineConfig } from "vitest/config"

export default defineConfig({
  test: {
    projects: ["scripts/vitest.config.ts", "packages/*/vitest.config.ts", "packages/tools/*/vitest.config.ts"]
  }
})
