import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const Address = Schema.Struct({
  id: Schema.suspend((): Schema.Schema<Models.AddressId> => Models.AddressId),
  customer_id: Schema.suspend((): Schema.Schema<Models.CustomerId> => Models.CustomerId),
  description: Schema.NullOr(Schema.suspend((): Schema.Schema<Models.AddressDescription> => Models.AddressDescription)),
  first_line: Schema.NullOr(Schema.suspend((): Schema.Schema<Models.AddressFirstLine> => Models.AddressFirstLine)),
  second_line: Schema.NullOr(Schema.suspend((): Schema.Schema<Models.AddressSecondLine> => Models.AddressSecondLine)),
  city: Schema.NullOr(Schema.suspend((): Schema.Schema<Models.AddressCity> => Models.AddressCity)),
  postal_code: Schema.NullOr(Schema.suspend((): Schema.Schema<Models.AddressPostalCode> => Models.AddressPostalCode)),
  region: Schema.NullOr(Schema.suspend((): Schema.Schema<Models.AddressRegion> => Models.AddressRegion)),
  country_code: Schema.suspend((): Schema.Schema<Models.CountryCode> => Models.CountryCode),
  custom_data: Schema.NullOr(Schema.suspend((): Schema.Schema<Models.CustomData> => Models.CustomData)),
  status: Schema.suspend((): Schema.Schema<Models.Status> => Models.Status),
  created_at: Schema.suspend((): Schema.Schema<Models.CreatedAt> => Models.CreatedAt),
  updated_at: Schema.suspend((): Schema.Schema<Models.UpdatedAt> => Models.UpdatedAt),
  import_meta: Schema.NullOr(Schema.suspend((): Schema.Schema<Models.ImportMeta> => Models.ImportMeta))
})
export type Address = typeof Address.Type
