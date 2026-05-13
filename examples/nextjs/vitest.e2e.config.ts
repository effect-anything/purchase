import { defineProject, mergeConfig } from "vitest/config"

import shared from "../../vitest.shared.ts"

export default mergeConfig(
  shared,
  defineProject({
    root: import.meta.dirname,
    test: {
      name: "@effect-x/purchase-nextjs-e2e",
      environment: "node",
      include: ["e2e/**/!(*.browser).test.{ts,tsx}"],
      exclude: ["test/**"]
    }
  })
)
