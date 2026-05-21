import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const CustomerEntity = Schema.Struct({
  id: Schema.String,
  mode: Schema.suspend((): Schema.Schema<Models.EnvironmentMode> => Models.EnvironmentMode),
  object: Schema.String,
  email: Schema.String,
  name: Schema.optional(Schema.NullOr(Schema.String)),
  metadata: Schema.optional(Schema.NullOr(Schema.Record({ key: Schema.String, value: Schema.Unknown }))),
  country: Schema.String,
  created_at: Schema.String,
  updated_at: Schema.String
})
export type CustomerEntity = typeof CustomerEntity.Type
