import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const PaymentRecord = Schema.Struct({
  amount: Schema.suspend((): typeof Models.PaymentsPrimitivesPaymentRecordsResourceAmount => Models.PaymentsPrimitivesPaymentRecordsResourceAmount),
  amount_authorized: Schema.suspend((): typeof Models.PaymentsPrimitivesPaymentRecordsResourceAmount => Models.PaymentsPrimitivesPaymentRecordsResourceAmount),
  amount_canceled: Schema.suspend((): typeof Models.PaymentsPrimitivesPaymentRecordsResourceAmount => Models.PaymentsPrimitivesPaymentRecordsResourceAmount),
  amount_failed: Schema.suspend((): typeof Models.PaymentsPrimitivesPaymentRecordsResourceAmount => Models.PaymentsPrimitivesPaymentRecordsResourceAmount),
  amount_guaranteed: Schema.suspend((): typeof Models.PaymentsPrimitivesPaymentRecordsResourceAmount => Models.PaymentsPrimitivesPaymentRecordsResourceAmount),
  amount_refunded: Schema.suspend((): typeof Models.PaymentsPrimitivesPaymentRecordsResourceAmount => Models.PaymentsPrimitivesPaymentRecordsResourceAmount),
  amount_requested: Schema.suspend((): typeof Models.PaymentsPrimitivesPaymentRecordsResourceAmount => Models.PaymentsPrimitivesPaymentRecordsResourceAmount),
  application: Schema.NullOr(Schema.String),
  created: Schema.Number,
  customer_details: Schema.NullOr(Schema.suspend((): typeof Models.PaymentsPrimitivesPaymentRecordsResourceCustomerDetails => Models.PaymentsPrimitivesPaymentRecordsResourceCustomerDetails)),
  customer_presence: Schema.NullOr(Schema.Literal("off_session", "on_session")),
  description: Schema.NullOr(Schema.String),
  id: Schema.String,
  latest_payment_attempt_record: Schema.NullOr(Schema.String),
  livemode: Schema.Boolean,
  metadata: Schema.Record({ key: Schema.String, value: Schema.String }),
  object: Schema.Literal("payment_record"),
  payment_method_details: Schema.NullOr(Schema.suspend((): typeof Models.PaymentsPrimitivesPaymentRecordsResourcePaymentMethodDetails => Models.PaymentsPrimitivesPaymentRecordsResourcePaymentMethodDetails)),
  processor_details: Schema.suspend((): typeof Models.PaymentsPrimitivesPaymentRecordsResourceProcessorDetails => Models.PaymentsPrimitivesPaymentRecordsResourceProcessorDetails),
  reported_by: Schema.Literal("self", "stripe"),
  shipping_details: Schema.NullOr(Schema.suspend((): typeof Models.PaymentsPrimitivesPaymentRecordsResourceShippingDetails => Models.PaymentsPrimitivesPaymentRecordsResourceShippingDetails)),
})
export type PaymentRecord = typeof PaymentRecord.Type
