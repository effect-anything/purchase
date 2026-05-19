import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const DisputeVisaCompellingEvidence3DisputedTransaction = Schema.Struct({
  customer_account_id: Schema.NullOr(Schema.String),
  customer_device_fingerprint: Schema.NullOr(Schema.String),
  customer_device_id: Schema.NullOr(Schema.String),
  customer_email_address: Schema.NullOr(Schema.String),
  customer_purchase_ip: Schema.NullOr(Schema.String),
  merchandise_or_services: Schema.NullOr(Schema.Literal("merchandise", "services")),
  product_description: Schema.NullOr(Schema.String),
  shipping_address: Schema.NullOr(Schema.suspend((): typeof Models.DisputeTransactionShippingAddress => Models.DisputeTransactionShippingAddress)),
})
export type DisputeVisaCompellingEvidence3DisputedTransaction = typeof DisputeVisaCompellingEvidence3DisputedTransaction.Type
