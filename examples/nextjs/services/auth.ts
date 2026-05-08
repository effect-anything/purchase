import { Effect } from "effect"
import { redirect } from "next/navigation"
import { cache } from "react"

import type { AuthenticatedUser } from "./app-runtime.ts"

import * as Next from "../lib/nextjs.ts"
import { serverRuntime } from "../runtime.ts"
import { AuthService, type AuthSession } from "./auth/auth-service.ts"

const getSession_ = Effect.fn("getSession_")(function* (testId: string) {
  const requestHeaders = yield* Next.Headers
  const auth = yield* AuthService

  let s = yield* auth.getSession({ headers: new Headers(requestHeaders) })
  console.log("????", Date.now(), s)
  return s
})

export const getSession = cache((testId: string) => serverRuntime.runPromise(getSession_(testId)))

export async function requireSession() {
  const session = await getSession()

  if (!session) {
    redirect("/sign-in")
  }

  return session
}

export async function getSessionOrThrow() {
  const session = await getSession()

  if (!session) {
    throw new Error("Authentication required.")
  }

  return session
}

export function sessionUser(session: NonNullable<AuthSession>): AuthenticatedUser {
  return {
    id: session.user.id,
    name: session.user.name,
    email: session.user.email,
    workspaceSlug: session.user.workspaceSlug,
    creditsUsed: session.user.creditsUsed
  }
}
