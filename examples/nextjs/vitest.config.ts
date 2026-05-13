import { defineConfig } from "vitest/config"

export default defineConfig({
  test: {
    projects: ["./vitest.workers.config.ts", "./vitest.e2e.config.ts"]
  }
})
