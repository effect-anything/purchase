import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const DisputeVisaCompellingEvidence3PriorUndisputedTransaction = Schema.Struct({
  charge: Schema.String,
  customer_account_id: Schema.NullOr(Schema.String),
  customer_device_fingerprint: Schema.NullOr(Schema.String),
  customer_device_id: Schema.NullOr(Schema.String),
  customer_email_address: Schema.NullOr(Schema.String),
  customer_purchase_ip: Schema.NullOr(Schema.String),
  product_description: Schema.NullOr(Schema.String),
  shipping_address: Schema.NullOr(
    Schema.suspend(
      (): Schema.Schema<Models.DisputeTransactionShippingAddress, any, any> =>
        Models.DisputeTransactionShippingAddress as Schema.Schema<Models.DisputeTransactionShippingAddress, any, any>
    )
  )
})
export type DisputeVisaCompellingEvidence3PriorUndisputedTransaction =
  typeof DisputeVisaCompellingEvidence3PriorUndisputedTransaction.Type
