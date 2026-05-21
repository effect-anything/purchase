import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export type Product = {
  readonly active: boolean
  readonly created: number
  readonly default_price?: string | Models.Price | null
  readonly description: string | null
  readonly id: string
  readonly images: ReadonlyArray<string>
  readonly livemode: boolean
  readonly marketing_features: ReadonlyArray<Models.ProductMarketingFeature>
  readonly metadata: Readonly<Record<string, string>>
  readonly name: string
  readonly object: "product"
  readonly package_dimensions: Models.PackageDimensions | null
  readonly shippable: boolean | null
  readonly statement_descriptor?: string | null
  readonly tax_code?: string | Models.TaxCode | null
  readonly type: "good" | "service"
  readonly unit_label?: string | null
  readonly updated: number
  readonly url: string | null
}

export const Product = Schema.Struct({
  active: Schema.Boolean,
  created: Schema.Number,
  default_price: Schema.optional(
    Schema.NullOr(
      Schema.Union(
        Schema.String,
        Schema.suspend(
          (): Schema.Schema<Models.Price, any, any> => Models.Price as Schema.Schema<Models.Price, any, any>
        )
      )
    )
  ),
  description: Schema.NullOr(Schema.String),
  id: Schema.String,
  images: Schema.Array(Schema.String),
  livemode: Schema.Boolean,
  marketing_features: Schema.Array(
    Schema.suspend(
      (): Schema.Schema<Models.ProductMarketingFeature, any, any> =>
        Models.ProductMarketingFeature as Schema.Schema<Models.ProductMarketingFeature, any, any>
    )
  ),
  metadata: Schema.Record({ key: Schema.String, value: Schema.String }),
  name: Schema.String,
  object: Schema.Literal("product"),
  package_dimensions: Schema.NullOr(
    Schema.suspend(
      (): Schema.Schema<Models.PackageDimensions, any, any> =>
        Models.PackageDimensions as Schema.Schema<Models.PackageDimensions, any, any>
    )
  ),
  shippable: Schema.NullOr(Schema.Boolean),
  statement_descriptor: Schema.optional(Schema.NullOr(Schema.String)),
  tax_code: Schema.optional(
    Schema.NullOr(
      Schema.Union(
        Schema.String,
        Schema.suspend(
          (): Schema.Schema<Models.TaxCode, any, any> => Models.TaxCode as Schema.Schema<Models.TaxCode, any, any>
        )
      )
    )
  ),
  type: Schema.Literal("good", "service"),
  unit_label: Schema.optional(Schema.NullOr(Schema.String)),
  updated: Schema.Number,
  url: Schema.NullOr(Schema.String)
})
