import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const PaymentPagesCheckoutSessionCustomerDetails = Schema.Struct({
  address: Schema.NullOr(Schema.suspend((): typeof Models.Address => Models.Address)),
  business_name: Schema.NullOr(Schema.String),
  email: Schema.NullOr(Schema.String),
  individual_name: Schema.NullOr(Schema.String),
  name: Schema.NullOr(Schema.String),
  phone: Schema.NullOr(Schema.String),
  tax_exempt: Schema.NullOr(Schema.Literal("exempt", "none", "reverse")),
  tax_ids: Schema.NullOr(Schema.Array(Schema.suspend((): typeof Models.PaymentPagesCheckoutSessionTaxId => Models.PaymentPagesCheckoutSessionTaxId))),
})
export type PaymentPagesCheckoutSessionCustomerDetails = typeof PaymentPagesCheckoutSessionCustomerDetails.Type
