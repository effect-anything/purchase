import { Schema } from "effect"

import { AuthenticatedUserSchema } from "../authenticated-user.ts"

export const AuthSessionSummarySchema = Schema.Struct({
  user: AuthenticatedUserSchema
})

export const AuthApiResponse = Schema.Struct({
  session: Schema.NullOr(AuthSessionSummarySchema)
})
