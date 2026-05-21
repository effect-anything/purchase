import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const CustomerCreateRequest = Schema.Struct({
  email: Schema.String,
  name: Schema.String,
  phone_number: Schema.optional(Schema.String),
  metadata: Schema.optional(Schema.suspend((): Schema.Schema<Models.Metadata> => Models.Metadata))
})
export type CustomerCreateRequest = typeof CustomerCreateRequest.Type
