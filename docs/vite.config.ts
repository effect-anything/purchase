import { cloudflare } from "@cloudflare/vite-plugin"
import tailwindcss from "@tailwindcss/vite"
import fumadocsMdx from "fumadocs-mdx/vite"
import vinext from "vinext"
import { defineConfig } from "vite"

import * as sourceConfig from "./source.config"

export default defineConfig(async () => ({
  optimizeDeps: {
    include: ["debug", "extend", "style-to-js"],
    exclude: ["fumadocs-core", "fumadocs-ui", "fumadocs-ui/provider/next"]
  },
  plugins: [
    await fumadocsMdx(sourceConfig),
    tailwindcss(),
    vinext(),
    cloudflare({
      viteEnvironment: { name: "rsc", childEnvironments: ["ssr"] }
    })
  ]
}))
