import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const Address = Schema.Struct({
  id: Schema.suspend(
    (): Schema.Schema<Models.AddressId, any, any> => Models.AddressId as Schema.Schema<Models.AddressId, any, any>
  ),
  customer_id: Schema.suspend(
    (): Schema.Schema<Models.CustomerId, any, any> => Models.CustomerId as Schema.Schema<Models.CustomerId, any, any>
  ),
  description: Schema.NullOr(
    Schema.suspend(
      (): Schema.Schema<Models.AddressDescription, any, any> =>
        Models.AddressDescription as Schema.Schema<Models.AddressDescription, any, any>
    )
  ),
  first_line: Schema.NullOr(
    Schema.suspend(
      (): Schema.Schema<Models.AddressFirstLine, any, any> =>
        Models.AddressFirstLine as Schema.Schema<Models.AddressFirstLine, any, any>
    )
  ),
  second_line: Schema.NullOr(
    Schema.suspend(
      (): Schema.Schema<Models.AddressSecondLine, any, any> =>
        Models.AddressSecondLine as Schema.Schema<Models.AddressSecondLine, any, any>
    )
  ),
  city: Schema.NullOr(
    Schema.suspend(
      (): Schema.Schema<Models.AddressCity, any, any> =>
        Models.AddressCity as Schema.Schema<Models.AddressCity, any, any>
    )
  ),
  postal_code: Schema.NullOr(
    Schema.suspend(
      (): Schema.Schema<Models.AddressPostalCode, any, any> =>
        Models.AddressPostalCode as Schema.Schema<Models.AddressPostalCode, any, any>
    )
  ),
  region: Schema.NullOr(
    Schema.suspend(
      (): Schema.Schema<Models.AddressRegion, any, any> =>
        Models.AddressRegion as Schema.Schema<Models.AddressRegion, any, any>
    )
  ),
  country_code: Schema.suspend(
    (): Schema.Schema<Models.CountryCode, any, any> => Models.CountryCode as Schema.Schema<Models.CountryCode, any, any>
  ),
  custom_data: Schema.NullOr(
    Schema.suspend(
      (): Schema.Schema<Models.CustomData, any, any> => Models.CustomData as Schema.Schema<Models.CustomData, any, any>
    )
  ),
  status: Schema.suspend(
    (): Schema.Schema<Models.Status, any, any> => Models.Status as Schema.Schema<Models.Status, any, any>
  ),
  created_at: Schema.suspend(
    (): Schema.Schema<Models.CreatedAt, any, any> => Models.CreatedAt as Schema.Schema<Models.CreatedAt, any, any>
  ),
  updated_at: Schema.suspend(
    (): Schema.Schema<Models.UpdatedAt, any, any> => Models.UpdatedAt as Schema.Schema<Models.UpdatedAt, any, any>
  ),
  import_meta: Schema.NullOr(
    Schema.suspend(
      (): Schema.Schema<Models.ImportMeta, any, any> => Models.ImportMeta as Schema.Schema<Models.ImportMeta, any, any>
    )
  )
})
export type Address = typeof Address.Type
