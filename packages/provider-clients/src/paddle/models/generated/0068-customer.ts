import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const Customer = Schema.Struct({
  id: Schema.suspend(() => Models.CustomerId),
  name: Schema.NullOr(Schema.suspend(() => Models.Name)),
  email: Schema.suspend(() => Models.Email),
  marketing_consent: Schema.Boolean,
  status: Schema.suspend(() => Models.Status),
  custom_data: Schema.NullOr(Schema.suspend(() => Models.CustomData)),
  locale: Schema.String,
  created_at: Schema.suspend(() => Models.CreatedAt),
  updated_at: Schema.suspend(() => Models.UpdatedAt),
  import_meta: Schema.NullOr(Schema.suspend(() => Models.ImportMeta)),
})
export type Customer = typeof Customer.Type
