import { HttpApiBuilder } from "@effect/platform"
import { Effect, Layer } from "effect"

import { AuthenticationRequired } from "../../errors.ts"
import { AppApi } from "../api/http-api.ts"

export const CreditsHttpLive = HttpApiBuilder.group(AppApi, "credits", (handlers) =>
  handlers.handle("consume", ({ payload }) =>
    Effect.gen(function* () {
      // const session = yield* Effect.tryPromise(() => getSession()).pipe(
      //   Effect.flatMap((value) =>
      //     value
      //       ? Effect.succeed(value)
      //       : Effect.fail(new AuthenticationRequired({ message: "Authentication required." }))
      //   )
      // )

      const amount = typeof payload.amount === "number" ? Math.max(1, Math.floor(payload.amount)) : 25
      const reason =
        typeof payload.reason === "string" && payload.reason.length > 0 ? payload.reason : "AI note summarization"
      // const wallet = yield* consumeUserCredits({ user: sessionUser(session), amount, reason })

      return {
        // wallet
      } as any
    })
  )
)
