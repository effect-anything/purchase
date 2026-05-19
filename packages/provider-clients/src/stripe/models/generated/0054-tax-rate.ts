import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const TaxRate = Schema.Struct({
  active: Schema.Boolean,
  country: Schema.NullOr(Schema.String),
  created: Schema.Number,
  description: Schema.NullOr(Schema.String),
  display_name: Schema.String,
  effective_percentage: Schema.NullOr(Schema.Number),
  flat_amount: Schema.NullOr(Schema.suspend((): typeof Models.TaxRateFlatAmount => Models.TaxRateFlatAmount)),
  id: Schema.String,
  inclusive: Schema.Boolean,
  jurisdiction: Schema.NullOr(Schema.String),
  jurisdiction_level: Schema.NullOr(Schema.Literal("city", "country", "county", "district", "multiple", "state")),
  livemode: Schema.Boolean,
  metadata: Schema.NullOr(Schema.Record({ key: Schema.String, value: Schema.String })),
  object: Schema.Literal("tax_rate"),
  percentage: Schema.Number,
  rate_type: Schema.NullOr(Schema.Literal("flat_amount", "percentage")),
  state: Schema.NullOr(Schema.String),
  tax_type: Schema.NullOr(Schema.Literal("amusement_tax", "communications_tax", "gst", "hst", "igst", "jct", "lease_tax", "pst", "qst", "retail_delivery_fee", "rst", "sales_tax", "service_tax", "vat")),
})
export type TaxRate = typeof TaxRate.Type
