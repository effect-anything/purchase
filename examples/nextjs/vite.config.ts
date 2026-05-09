import { cloudflare } from "@cloudflare/vite-plugin"
import tailwindcss from "@tailwindcss/vite"
import vinext from "vinext"
import { defineConfig } from "vite"

export default defineConfig({
  server: {
    allowedHosts: [".ngrok-free.app"]
  },
  plugins: [
    tailwindcss(),
    vinext(),
    cloudflare({
      viteEnvironment: { name: "rsc", childEnvironments: ["ssr"] }
    })
  ]
})
