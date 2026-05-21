import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const Member = Schema.Struct({
  id: Schema.String,
  created_at: Schema.String,
  modified_at: Schema.NullOr(Schema.String),
  customer_id: Schema.String,
  email: Schema.String,
  name: Schema.NullOr(Schema.String),
  external_id: Schema.NullOr(Schema.String),
  role: Schema.suspend(
    (): Schema.Schema<Models.MemberRole, any, any> => Models.MemberRole as Schema.Schema<Models.MemberRole, any, any>
  )
})
export type Member = typeof Member.Type
