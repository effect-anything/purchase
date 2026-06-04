import * as Effect from "effect/Effect"
import * as Match from "effect/Match"

import { prepare as paddleVendorPrepare } from "../paddle/internal/paddle-vendor-prepare.ts"
import { PaymentProvider } from "../provider/client.ts"
import { buildUnsupportedPrepareResult, type ProviderPrepareOptions } from "./provider-prepare.ts"

export const prepare = Effect.fn(function* (options: ProviderPrepareOptions = { environment: "sandbox" }) {
  const provider = yield* PaymentProvider

  const result = Match.type<typeof provider>().pipe(
    Match.tag("paddle", () => paddleVendorPrepare(options)),
    // Match.tag("stripe", () => Effect.void),
    Match.orElse(() => Effect.succeed(buildUnsupportedPrepareResult(provider._tag, options)))
  )

  return yield* result(provider)
})
