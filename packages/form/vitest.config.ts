import { playwright } from "@vitest/browser-playwright"
import { mergeConfig } from "vitest/config"
import shared from "../../vitest.shared.ts"

export default mergeConfig(shared, {
  optimizeDeps: {
    include: [
      "@effect-atom/atom/Atom",
      "@effect-atom/atom/AtomHttpApi",
      "@effect-atom/atom/AtomRef",
      "@effect-atom/atom/AtomRpc",
      "@effect-atom/atom/Registry",
      "@effect-atom/atom/Result",
      "@effect/platform",
      "effect/Cause",
      "effect/Deferred",
      "effect/Duration",
      "effect/Either",
      "effect/Equal",
      "effect/Exit",
      "effect/GlobalValue",
      "effect/Layer",
      "effect/Predicate",
      "effect/Runtime",
      "react",
      "react-hook-form",
      "react/jsx-dev-runtime",
      "scheduler",
      "vitest-browser-react"
    ]
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
