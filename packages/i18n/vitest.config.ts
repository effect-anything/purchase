import { playwright } from "@vitest/browser-playwright"
import { mergeConfig } from "vitest/config"
import shared from "../../vitest.shared.ts"

export default mergeConfig(shared, {
  optimizeDeps: {
    include: ["react", "react-i18next"]
  },
  test: {
    environment: "jsdom",
    fileParallelism: false,
    browser: {
      provider: playwright(),
      enabled: false,
      fileParallelism: false,
      headless: true,
      instances: [
        {
          browser: "chromium",
          include: ["test/**/*.browser.test.{ts,tsx}"]
        }
      ]
    },
    sequence: {
      concurrent: false
    }
  }
})
