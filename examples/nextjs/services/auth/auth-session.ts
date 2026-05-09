import type { AuthenticatedUser } from "../authenticated-user.ts"
import type { AuthSession } from "./auth-service.ts"

export function sessionUser(session: NonNullable<AuthSession>): AuthenticatedUser {
  return {
    id: session.user.id,
    name: session.user.name,
    email: session.user.email,
    workspaceSlug: session.user.workspaceSlug,
    creditsUsed: session.user.creditsUsed
  }
}
