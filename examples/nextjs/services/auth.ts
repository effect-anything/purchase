import { Effect } from "effect"

import * as Next from "../lib/nextjs.ts"
import { AuthService, type AuthSession } from "./auth/auth-service.ts"
export { sessionUser } from "./auth/auth-session.ts"

export const getSession = Next.cachedServerFunction(() =>
  Effect.gen(function* () {
    const requestHeaders = yield* Next.Headers
    const auth = yield* AuthService

    return yield* auth.getSession({ headers: new Headers(requestHeaders) })
  })
)

export const requireSession = Next.serverFunction(() =>
  Effect.gen(function* () {
    const requestHeaders = yield* Next.Headers
    const auth = yield* AuthService
    const session = yield* auth.getSession({ headers: new Headers(requestHeaders) })

    if (!session) {
      return yield* Next.Redirect("/sign-in")
    }

    return session
  })
)

export const getSessionOrThrow = Next.serverFunction(() =>
  Effect.gen(function* () {
    const requestHeaders = yield* Next.Headers
    const auth = yield* AuthService
    const session = yield* auth.getSession({ headers: new Headers(requestHeaders) })

    if (!session) {
      return yield* Effect.dieMessage("Authentication required.")
    }

    return session
  })
)
