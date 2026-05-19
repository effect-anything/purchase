import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const Address = Schema.Struct({
  id: Schema.suspend(() => Models.AddressId),
  customer_id: Schema.suspend(() => Models.CustomerId),
  description: Schema.NullOr(Schema.suspend(() => Models.AddressDescription)),
  first_line: Schema.NullOr(Schema.suspend(() => Models.AddressFirstLine)),
  second_line: Schema.NullOr(Schema.suspend(() => Models.AddressSecondLine)),
  city: Schema.NullOr(Schema.suspend(() => Models.AddressCity)),
  postal_code: Schema.NullOr(Schema.suspend(() => Models.AddressPostalCode)),
  region: Schema.NullOr(Schema.suspend(() => Models.AddressRegion)),
  country_code: Schema.suspend(() => Models.CountryCode),
  custom_data: Schema.NullOr(Schema.suspend(() => Models.CustomData)),
  status: Schema.suspend(() => Models.Status),
  created_at: Schema.suspend(() => Models.CreatedAt),
  updated_at: Schema.suspend(() => Models.UpdatedAt),
  import_meta: Schema.NullOr(Schema.suspend(() => Models.ImportMeta)),
})
export type Address = typeof Address.Type
