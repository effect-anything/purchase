import { cloudflareTest } from "@cloudflare/vitest-pool-workers"
import { defineProject, mergeConfig } from "vitest/config"

import shared from "../../vitest.shared.ts"

export default mergeConfig(
  shared,
  defineProject({
    root: import.meta.dirname,
    plugins: [
      cloudflareTest({
        wrangler: { configPath: "./wrangler.jsonc" },
        main: undefined,
        miniflare: {
          compatibilityFlags: ["nodejs_compat", "experimental"]
        }
      })
    ],
    test: {
      name: "@effect-x/purchase-nextjs-workers",
      include: ["test/**/!(*.browser).test.{ts,tsx}"],
      exclude: ["e2e/**"]
    }
  })
)
