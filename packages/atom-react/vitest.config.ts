import { playwright } from "@vitest/browser-playwright"
import { mergeConfig } from "vitest/config"
import shared from "../../vitest.shared.ts"

export default mergeConfig(shared, {
  test: {
    environment: "jsdom",
    include: ["test/**/*.test.ts", "test/**/!(*.browser).test.tsx"],
    browser: {
      provider: playwright(),
      enabled: false,
      headless: true,
      instances: [
        {
          browser: "chromium",
          include: ["test/**/*.browser.test.{ts,tsx}"]
        }
      ]
    }
  }
})
