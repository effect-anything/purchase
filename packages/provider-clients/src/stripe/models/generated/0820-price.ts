import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export type Price = {
  readonly active: boolean
  readonly billing_scheme: "per_unit" | "tiered"
  readonly created: number
  readonly currency: string
  readonly currency_options?: Readonly<Record<string, Models.CurrencyOption>>
  readonly custom_unit_amount: Models.CustomUnitAmount | null
  readonly id: string
  readonly livemode: boolean
  readonly lookup_key: string | null
  readonly metadata: Readonly<Record<string, string>>
  readonly nickname: string | null
  readonly object: "price"
  readonly product: string | Models.Product | Models.DeletedProduct
  readonly recurring: Models.Recurring | null
  readonly tax_behavior: "exclusive" | "inclusive" | "unspecified" | null
  readonly tiers?: ReadonlyArray<Models.PriceTier>
  readonly tiers_mode: "graduated" | "volume" | null
  readonly transform_quantity: Models.TransformQuantity | null
  readonly type: "one_time" | "recurring"
  readonly unit_amount: number | null
  readonly unit_amount_decimal: string | null
}

export const Price = Schema.Struct({
  active: Schema.Boolean,
  billing_scheme: Schema.Literal("per_unit", "tiered"),
  created: Schema.Number,
  currency: Schema.String,
  currency_options: Schema.optional(
    Schema.Record({
      key: Schema.String,
      value: Schema.suspend(
        (): Schema.Schema<Models.CurrencyOption, any, any> =>
          Models.CurrencyOption as Schema.Schema<Models.CurrencyOption, any, any>
      )
    })
  ),
  custom_unit_amount: Schema.NullOr(
    Schema.suspend(
      (): Schema.Schema<Models.CustomUnitAmount, any, any> =>
        Models.CustomUnitAmount as Schema.Schema<Models.CustomUnitAmount, any, any>
    )
  ),
  id: Schema.String,
  livemode: Schema.Boolean,
  lookup_key: Schema.NullOr(Schema.String),
  metadata: Schema.Record({ key: Schema.String, value: Schema.String }),
  nickname: Schema.NullOr(Schema.String),
  object: Schema.Literal("price"),
  product: Schema.Union(
    Schema.String,
    Schema.suspend(
      (): Schema.Schema<Models.Product, any, any> => Models.Product as Schema.Schema<Models.Product, any, any>
    ),
    Schema.suspend(
      (): Schema.Schema<Models.DeletedProduct, any, any> =>
        Models.DeletedProduct as Schema.Schema<Models.DeletedProduct, any, any>
    )
  ),
  recurring: Schema.NullOr(
    Schema.suspend(
      (): Schema.Schema<Models.Recurring, any, any> => Models.Recurring as Schema.Schema<Models.Recurring, any, any>
    )
  ),
  tax_behavior: Schema.NullOr(Schema.Literal("exclusive", "inclusive", "unspecified")),
  tiers: Schema.optional(
    Schema.Array(
      Schema.suspend(
        (): Schema.Schema<Models.PriceTier, any, any> => Models.PriceTier as Schema.Schema<Models.PriceTier, any, any>
      )
    )
  ),
  tiers_mode: Schema.NullOr(Schema.Literal("graduated", "volume")),
  transform_quantity: Schema.NullOr(
    Schema.suspend(
      (): Schema.Schema<Models.TransformQuantity, any, any> =>
        Models.TransformQuantity as Schema.Schema<Models.TransformQuantity, any, any>
    )
  ),
  type: Schema.Literal("one_time", "recurring"),
  unit_amount: Schema.NullOr(Schema.Number),
  unit_amount_decimal: Schema.NullOr(Schema.String)
})
