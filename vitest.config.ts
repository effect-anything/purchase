import { defineConfig } from "vitest/config"

let p = defineConfig({
  test: {
    projects: [
      "scripts/vitest.config.ts",
      "packages/purchase/vitest.{unit,e2e}.config.ts",
      "packages/tools/*/vitest.config.ts",
      "docs/*/vitest.config.ts",
      "examples/*/vitest.{workers,e2e}.config.ts"
    ]
  }
})

export default p
