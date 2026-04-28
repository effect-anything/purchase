import { playwright } from "@vitest/browser-playwright"
import { mergeConfig } from "vitest/config"
import shared from "../../vitest.shared.ts"

export default mergeConfig(shared, {
  optimizeDeps: {
    include: ["react", "react/jsx-dev-runtime", "react-i18next", "vitest-browser-react"]
  },
  test: {
    environment: "node",
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
