import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const CustomerRequestEntity = Schema.Struct({
  id: Schema.optional(Schema.String),
  email: Schema.optional(Schema.String)
})
export type CustomerRequestEntity = typeof CustomerRequestEntity.Type
