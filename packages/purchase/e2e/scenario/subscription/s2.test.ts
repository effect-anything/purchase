import { PaymentHarness } from "@effect-x/purchase/harness"
import { Paddle } from "@effect-x/purchase/paddle"
import { PlatformConfigProvider } from "@effect/platform"
import { NodeContext } from "@effect/platform-node"
import { describe, expect, it } from "@effect/vitest"
import { Effect, Layer, Logger, LogLevel } from "effect"
import { inject } from "vitest"

import * as Harness from "../../http-api/harness.ts"

const providerE2E = inject("purchaseProviderE2E")

const providers = process.env.PROVIDER ? [process.env.PROVIDER] : ["paddle", "stripe"]

describe.each(providers)("p2 (%s) test", (provider) => {
  it.todo("p2")

  it.effect("pass", () =>
    Effect.gen(function* () {
      console.log("P211111")
    })
  )

  it.layer(Layer.empty)((it) => {
    it.effect("pass", () => Effect.gen(function* () {}))

    it.effect("pass2", () => Effect.gen(function* () {}))
  })
})
