import * as Effect from "effect/Effect"

import { PaddleVendorPrepareService } from "../paddle/internal/paddle-vendor-prepare.ts"
import { PaymentProvider } from "../provider/client.ts"
import { buildUnsupportedPrepareResult, type ProviderPrepareInput } from "./provider-prepare.ts"

export const prepare = Effect.fn(function* (input: ProviderPrepareInput = { environment: "sandbox" }) {
  const provider = yield* PaymentProvider
  const paddleProviderPrepare = yield* Effect.serviceOption(PaddleVendorPrepareService)

  return yield* provider._tag === "paddle" && paddleProviderPrepare._tag === "Some"
    ? paddleProviderPrepare.value.prepare(input)
    : Effect.succeed(buildUnsupportedPrepareResult(provider._tag, input))
})
