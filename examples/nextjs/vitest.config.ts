import { cloudflareTest } from "@cloudflare/vitest-pool-workers"
import { mergeConfig, type ViteUserConfig } from "vitest/config"

import shared from "../../vitest.shared.ts"

const config: ViteUserConfig = {
  plugins: [
    cloudflareTest({
      wrangler: { configPath: "./wrangler.jsonc" },
      main: undefined,
      miniflare: {
        compatibilityFlags: ["nodejs_compat", "experimental"]
      }
    })
  ]
}

export default mergeConfig(shared, config)
