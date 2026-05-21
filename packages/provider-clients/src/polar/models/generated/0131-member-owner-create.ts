import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const MemberOwnerCreate = Schema.Struct({
  email: Schema.String,
  name: Schema.optional(Schema.NullOr(Schema.String)),
  external_id: Schema.optional(Schema.NullOr(Schema.String))
})
export type MemberOwnerCreate = typeof MemberOwnerCreate.Type
