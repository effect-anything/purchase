import { Context, Effect, Layer, Ref } from "effect"

import type { AuthenticatedUser } from "./domain.ts"

interface SessionRecord {
  readonly user: AuthenticatedUser
}

const sessionCookieName = "purchase_e2e_session"

export class SessionStore extends Context.Tag("SessionStore")<
  SessionStore,
  {
    readonly cookieName: string
    readonly create: (user: AuthenticatedUser) => Effect.Effect<string>
    readonly get: (sessionId: string) => Effect.Effect<SessionRecord | undefined>
  }
>() {
  static Live = Layer.effect(
    SessionStore,
    Effect.gen(function* () {
      const sessions = yield* Ref.make(new Map<string, SessionRecord>())

      return {
        cookieName: sessionCookieName,
        create: (user) =>
          Effect.gen(function* () {
            const sessionId = crypto.randomUUID()
            yield* Ref.update(sessions, (current) => new Map(current).set(sessionId, { user }))
            return sessionId
          }),
        get: (sessionId) => Ref.get(sessions).pipe(Effect.map((current) => current.get(sessionId)))
      }
    })
  )
}
