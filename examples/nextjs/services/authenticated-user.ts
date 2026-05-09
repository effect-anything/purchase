import { Schema } from "effect"

export type AuthenticatedUser = {
  readonly id: string
  readonly name: string
  readonly email: string
  readonly workspaceSlug: string
  readonly creditsUsed: number
}

export const AuthenticatedUserSchema = Schema.Struct({
  id: Schema.String,
  name: Schema.String,
  email: Schema.String,
  workspaceSlug: Schema.String,
  creditsUsed: Schema.Number
})
