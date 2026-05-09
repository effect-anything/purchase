import { HttpApiBuilder, HttpServerRequest } from "@effect/platform"
import { Effect } from "effect"

import { AppApi } from "../api/http-api.ts"
import { AuthService } from "./auth-service.ts"
import { sessionUser } from "./auth-session.ts"

export const AuthHttpLive = HttpApiBuilder.group(AppApi, "auth", (handlers) =>
  handlers.handle("get", () =>
    Effect.gen(function* () {
      const request = yield* HttpServerRequest.HttpServerRequest
      const auth = yield* AuthService
      const session = yield* auth.getSession({ headers: new Headers(request.headers) }).pipe(Effect.orDie)

      return {
        session: session
          ? {
              user: sessionUser(session)
            }
          : null
      }
    })
  )
)
