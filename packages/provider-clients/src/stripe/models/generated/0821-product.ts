import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const Product = Schema.Struct({
  active: Schema.Boolean,
  created: Schema.Number,
  default_price: Schema.optional(Schema.NullOr(Schema.Union(Schema.String, Schema.suspend((): typeof Models.Price => Models.Price)))),
  description: Schema.NullOr(Schema.String),
  id: Schema.String,
  images: Schema.Array(Schema.String),
  livemode: Schema.Boolean,
  marketing_features: Schema.Array(Schema.suspend((): typeof Models.ProductMarketingFeature => Models.ProductMarketingFeature)),
  metadata: Schema.Record({ key: Schema.String, value: Schema.String }),
  name: Schema.String,
  object: Schema.Literal("product"),
  package_dimensions: Schema.NullOr(Schema.suspend((): typeof Models.PackageDimensions => Models.PackageDimensions)),
  shippable: Schema.NullOr(Schema.Boolean),
  statement_descriptor: Schema.optional(Schema.NullOr(Schema.String)),
  tax_code: Schema.optional(Schema.NullOr(Schema.Union(Schema.String, Schema.suspend((): typeof Models.TaxCode => Models.TaxCode)))),
  type: Schema.Literal("good", "service"),
  unit_label: Schema.optional(Schema.NullOr(Schema.String)),
  updated: Schema.Number,
  url: Schema.NullOr(Schema.String),
})
export type Product = typeof Product.Type
