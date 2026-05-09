import { HttpApiBuilder, HttpServerRequest } from "@effect/platform"
import { Effect } from "effect"

import { AuthenticationRequired } from "../../errors.ts"
import { AppApi } from "../api/http-api.ts"
import { AuthService } from "../auth/auth-service.ts"
import { sessionUser } from "../auth/auth-session.ts"
import { purchaseEnvironment, purchaseProvider } from "../purchase-domain.ts"
import { AccountService } from "./account-service.ts"

export const AccountHttpApiLive = HttpApiBuilder.group(AppApi, "account", (handlers) =>
  handlers.handle("get", () =>
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
      const user = sessionUser(session)
      const account = yield* AccountService
      const overview = yield* account.loadOverview(user).pipe(Effect.orDie)

      return {
        environment: purchaseEnvironment,
        provider: purchaseProvider,
        ...overview
      }
    })
  )
)
