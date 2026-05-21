import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const CheckoutProductsCreate = Schema.Struct({
  trial_interval: Schema.optional(
    Schema.NullOr(
      Schema.suspend(
        (): Schema.Schema<Models.TrialInterval, any, any> =>
          Models.TrialInterval as Schema.Schema<Models.TrialInterval, any, any>
      )
    )
  ),
  trial_interval_count: Schema.optional(Schema.NullOr(Schema.Number)),
  metadata: Schema.optional(
    Schema.Record({
      key: Schema.String,
      value: Schema.Union(Schema.String, Schema.Number, Schema.Number, Schema.Boolean)
    })
  ),
  custom_field_data: Schema.optional(
    Schema.Record({
      key: Schema.String,
      value: Schema.NullOr(Schema.Union(Schema.String, Schema.Number, Schema.Boolean, Schema.String))
    })
  ),
  discount_id: Schema.optional(Schema.NullOr(Schema.String)),
  allow_discount_codes: Schema.optional(Schema.Boolean),
  require_billing_address: Schema.optional(Schema.Boolean),
  amount: Schema.optional(Schema.NullOr(Schema.Number)),
  seats: Schema.optional(Schema.NullOr(Schema.Number)),
  min_seats: Schema.optional(Schema.NullOr(Schema.Number)),
  max_seats: Schema.optional(Schema.NullOr(Schema.Number)),
  allow_trial: Schema.optional(Schema.Boolean),
  customer_id: Schema.optional(Schema.NullOr(Schema.String)),
  is_business_customer: Schema.optional(Schema.Boolean),
  external_customer_id: Schema.optional(Schema.NullOr(Schema.String)),
  customer_name: Schema.optional(Schema.NullOr(Schema.String)),
  customer_email: Schema.optional(Schema.NullOr(Schema.String)),
  customer_ip_address: Schema.optional(Schema.NullOr(Schema.String)),
  customer_billing_name: Schema.optional(Schema.NullOr(Schema.String)),
  customer_billing_address: Schema.optional(
    Schema.NullOr(
      Schema.suspend(
        (): Schema.Schema<Models.AddressInput, any, any> =>
          Models.AddressInput as Schema.Schema<Models.AddressInput, any, any>
      )
    )
  ),
  customer_tax_id: Schema.optional(Schema.NullOr(Schema.String)),
  customer_metadata: Schema.optional(
    Schema.Record({
      key: Schema.String,
      value: Schema.Union(Schema.String, Schema.Number, Schema.Number, Schema.Boolean)
    })
  ),
  subscription_id: Schema.optional(Schema.NullOr(Schema.String)),
  success_url: Schema.optional(Schema.NullOr(Schema.String)),
  return_url: Schema.optional(Schema.NullOr(Schema.String)),
  embed_origin: Schema.optional(Schema.NullOr(Schema.String)),
  locale: Schema.optional(Schema.NullOr(Schema.String)),
  currency: Schema.optional(
    Schema.NullOr(
      Schema.suspend(
        (): Schema.Schema<Models.PresentmentCurrency, any, any> =>
          Models.PresentmentCurrency as Schema.Schema<Models.PresentmentCurrency, any, any>
      )
    )
  ),
  products: Schema.Array(Schema.String),
  prices: Schema.optional(
    Schema.NullOr(
      Schema.Record({
        key: Schema.String,
        value: Schema.Array(
          Schema.Union(
            Schema.suspend(
              (): Schema.Schema<Models.ProductPriceFixedCreate, any, any> =>
                Models.ProductPriceFixedCreate as Schema.Schema<Models.ProductPriceFixedCreate, any, any>
            ),
            Schema.suspend(
              (): Schema.Schema<Models.ProductPriceCustomCreate, any, any> =>
                Models.ProductPriceCustomCreate as Schema.Schema<Models.ProductPriceCustomCreate, any, any>
            ),
            Schema.suspend(
              (): Schema.Schema<Models.ProductPriceFreeCreate, any, any> =>
                Models.ProductPriceFreeCreate as Schema.Schema<Models.ProductPriceFreeCreate, any, any>
            ),
            Schema.suspend(
              (): Schema.Schema<Models.ProductPriceSeatBasedCreate, any, any> =>
                Models.ProductPriceSeatBasedCreate as Schema.Schema<Models.ProductPriceSeatBasedCreate, any, any>
            ),
            Schema.suspend(
              (): Schema.Schema<Models.ProductPriceMeteredUnitCreate, any, any> =>
                Models.ProductPriceMeteredUnitCreate as Schema.Schema<Models.ProductPriceMeteredUnitCreate, any, any>
            )
          )
        )
      })
    )
  )
})
export type CheckoutProductsCreate = typeof CheckoutProductsCreate.Type
