import { playwright } from "@vitest/browser-playwright"
import { mergeConfig } from "vitest/config"
import shared from "../../../vitest.shared.ts"

export default mergeConfig(shared, {
  optimizeDeps: {
    include: [
      "@effect/experimental/VariantSchema",
      "@effect/platform-browser/BrowserWorkerRunner",
      "@effect/platform/WorkerRunner",
      "@effect/sql/Model",
      "@effect/sql/SqlResolver",
      "@effect/sql/SqlSchema",
      "effect/DateTime",
      "effect/Redacted",
      "effect/SchemaAST",
      "effect/SubscriptionRef",
      "nanoid",
      "uuid"
    ]
  },
  test: {
    environment: "node",
    fileParallelism: false,
    include: ["test/**/!(*.browser).test.ts", "test/**/!(*.browser).test.tsx"],
    browser: {
      enabled: false,
      fileParallelism: false,
      headless: true,
      provider: playwright(),
      instances: [
        {
          browser: "chromium",
          include: ["test/**/*.browser.test.{ts,tsx}"]
        }
      ]
    },
    sequence: {
      concurrent: false
    },
    setupFiles: ["test/setup.ts"]
  }
})
