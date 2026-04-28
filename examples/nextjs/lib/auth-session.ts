import { headers } from "next/headers"
import { redirect } from "next/navigation"

import type { AuthenticatedUser } from "./app-runtime.ts"

import { auth } from "./auth.ts"

export async function getSession() {
  return auth.api.getSession({
    headers: await headers()
  })
}

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

export function sessionUser(session: NonNullable<Awaited<ReturnType<typeof getSession>>>): AuthenticatedUser {
  return {
    id: session.user.id,
    name: session.user.name,
    email: session.user.email,
    workspaceSlug: session.user.workspaceSlug,
    creditsUsed: session.user.creditsUsed
  }
}
