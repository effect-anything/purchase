import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const PaymentPagesCheckoutSessionCustomerDetails = Schema.Struct({
  address: Schema.NullOr(
    Schema.suspend(
      (): Schema.Schema<Models.Address, any, any> => Models.Address as Schema.Schema<Models.Address, any, any>
    )
  ),
  business_name: Schema.NullOr(Schema.String),
  email: Schema.NullOr(Schema.String),
  individual_name: Schema.NullOr(Schema.String),
  name: Schema.NullOr(Schema.String),
  phone: Schema.NullOr(Schema.String),
  tax_exempt: Schema.NullOr(Schema.Literal("exempt", "none", "reverse")),
  tax_ids: Schema.NullOr(
    Schema.Array(
      Schema.suspend(
        (): Schema.Schema<Models.PaymentPagesCheckoutSessionTaxId, any, any> =>
          Models.PaymentPagesCheckoutSessionTaxId as Schema.Schema<Models.PaymentPagesCheckoutSessionTaxId, any, any>
      )
    )
  )
})
export type PaymentPagesCheckoutSessionCustomerDetails = typeof PaymentPagesCheckoutSessionCustomerDetails.Type
