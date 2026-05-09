import { CommercialWorkflowConflict } from "@effect-x/purchase/schema"
import { HttpApiBuilder, HttpServerRequest } from "@effect/platform"
import { Effect } from "effect"

import { AuthenticationRequired, CreditsConflict } from "../../errors.ts"
import { AppApi } from "../api/http-api.ts"
import { AuthService } from "../auth/auth-service.ts"
import { sessionUser } from "../auth/auth-session.ts"
import { CreditsService } from "./credits-service.ts"

export const CreditsHttpLive = HttpApiBuilder.group(AppApi, "credits", (handlers) =>
  handlers.handle("consume", ({ payload }) =>
    Effect.gen(function* () {
      const request = yield* HttpServerRequest.HttpServerRequest
      const auth = yield* AuthService
      const session = yield* auth
        .getSession({ headers: new Headers(request.headers) })
        .pipe(
          Effect.flatMap((value) =>
            value
              ? Effect.succeed(value)
              : Effect.fail(new AuthenticationRequired({ message: "Authentication required." }))
          )
        )

      const amount = typeof payload.amount === "number" ? Math.max(1, Math.floor(payload.amount)) : 25
      const reason =
        typeof payload.reason === "string" && payload.reason.length > 0 ? payload.reason : "AI note summarization"
      const credits = yield* CreditsService
      const wallet = yield* credits.consume({ user: sessionUser(session), amount, reason }).pipe(
        Effect.catchAll((error) =>
          error && typeof error === "object" && "_tag" in error && error._tag === "CommercialWorkflowConflict"
            ? Effect.fail(
                new CreditsConflict({
                  workflow: (error as CommercialWorkflowConflict).workflow,
                  message: (error as CommercialWorkflowConflict).message
                })
              )
            : Effect.die(error)
        )
      )

      return { wallet }
    })
  )
)
