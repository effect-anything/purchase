import { PaymentHarness } from "@effect-x/purchase/harness"
import { Paddle } from "@effect-x/purchase/paddle"
import { PlatformConfigProvider } from "@effect/platform"
import { NodeContext } from "@effect/platform-node"
import { describe, it } from "@effect/vitest"
import { Effect, Layer, ConfigProvider, Logger, LogLevel } from "effect"

import { syncCatalog, prepareProvider } from "../../../src/sync/config-service.ts"
import { CommercialPay } from "../../commercial-catalog.ts"
import * as Harness from "../../http-api/harness.ts"
import { HttpApiTesting } from "../../utils/api.ts"

// Harness | Pay
const Live = PaymentHarness.make({ browser: { headless: true } }).pipe(
  Layer.provideMerge(Paddle.layer),
  Layer.provide(
    Layer.setConfigProvider(
      ConfigProvider.fromJson({
        //
      })
    )
  ),
  Layer.provide(PlatformConfigProvider.layerDotEnvAdd(".env")),
  Layer.provide(NodeContext.layer),
  Layer.orDie
)

// NodeRuntime.runMain(program.pipe(Effect.provide(Live)))

describe("todo", () => {
  it.effect("pass", () =>
    Effect.gen(function* () {
      yield* Effect.logTrace("OK")

      // yield* Harness.signUp({})

      // yield* syncCatalog({})

      // const accountSession = yield* Harness.signUp({})
      // const accountOverview = yield* Harness.getAccount(accountSession)

      // Purchase
      // yield* Harness.checkout({ offerId: "notes:notes_pro_monthly", session: accountSession })
      // yield* Harness.purchaseSubscription({ session: accountSession, offerId: "notes:notes_pro_monthly" })
    }).pipe(
      Effect.provide(
        Live.pipe(
          Layer.provideMerge(HttpApiTesting),
          Layer.provide(Logger.pretty),
          Layer.provide(Logger.minimumLogLevel(LogLevel.All))
        )
      )
    )
  )
})
