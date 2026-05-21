import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const PaymentRecord = Schema.Struct({
  amount: Schema.suspend(
    (): Schema.Schema<Models.PaymentsPrimitivesPaymentRecordsResourceAmount, any, any> =>
      Models.PaymentsPrimitivesPaymentRecordsResourceAmount as Schema.Schema<
        Models.PaymentsPrimitivesPaymentRecordsResourceAmount,
        any,
        any
      >
  ),
  amount_authorized: Schema.suspend(
    (): Schema.Schema<Models.PaymentsPrimitivesPaymentRecordsResourceAmount, any, any> =>
      Models.PaymentsPrimitivesPaymentRecordsResourceAmount as Schema.Schema<
        Models.PaymentsPrimitivesPaymentRecordsResourceAmount,
        any,
        any
      >
  ),
  amount_canceled: Schema.suspend(
    (): Schema.Schema<Models.PaymentsPrimitivesPaymentRecordsResourceAmount, any, any> =>
      Models.PaymentsPrimitivesPaymentRecordsResourceAmount as Schema.Schema<
        Models.PaymentsPrimitivesPaymentRecordsResourceAmount,
        any,
        any
      >
  ),
  amount_failed: Schema.suspend(
    (): Schema.Schema<Models.PaymentsPrimitivesPaymentRecordsResourceAmount, any, any> =>
      Models.PaymentsPrimitivesPaymentRecordsResourceAmount as Schema.Schema<
        Models.PaymentsPrimitivesPaymentRecordsResourceAmount,
        any,
        any
      >
  ),
  amount_guaranteed: Schema.suspend(
    (): Schema.Schema<Models.PaymentsPrimitivesPaymentRecordsResourceAmount, any, any> =>
      Models.PaymentsPrimitivesPaymentRecordsResourceAmount as Schema.Schema<
        Models.PaymentsPrimitivesPaymentRecordsResourceAmount,
        any,
        any
      >
  ),
  amount_refunded: Schema.suspend(
    (): Schema.Schema<Models.PaymentsPrimitivesPaymentRecordsResourceAmount, any, any> =>
      Models.PaymentsPrimitivesPaymentRecordsResourceAmount as Schema.Schema<
        Models.PaymentsPrimitivesPaymentRecordsResourceAmount,
        any,
        any
      >
  ),
  amount_requested: Schema.suspend(
    (): Schema.Schema<Models.PaymentsPrimitivesPaymentRecordsResourceAmount, any, any> =>
      Models.PaymentsPrimitivesPaymentRecordsResourceAmount as Schema.Schema<
        Models.PaymentsPrimitivesPaymentRecordsResourceAmount,
        any,
        any
      >
  ),
  application: Schema.NullOr(Schema.String),
  created: Schema.Number,
  customer_details: Schema.NullOr(
    Schema.suspend(
      (): Schema.Schema<Models.PaymentsPrimitivesPaymentRecordsResourceCustomerDetails, any, any> =>
        Models.PaymentsPrimitivesPaymentRecordsResourceCustomerDetails as Schema.Schema<
          Models.PaymentsPrimitivesPaymentRecordsResourceCustomerDetails,
          any,
          any
        >
    )
  ),
  customer_presence: Schema.NullOr(Schema.Literal("off_session", "on_session")),
  description: Schema.NullOr(Schema.String),
  id: Schema.String,
  latest_payment_attempt_record: Schema.NullOr(Schema.String),
  livemode: Schema.Boolean,
  metadata: Schema.Record({ key: Schema.String, value: Schema.String }),
  object: Schema.Literal("payment_record"),
  payment_method_details: Schema.NullOr(
    Schema.suspend(
      (): Schema.Schema<Models.PaymentsPrimitivesPaymentRecordsResourcePaymentMethodDetails, any, any> =>
        Models.PaymentsPrimitivesPaymentRecordsResourcePaymentMethodDetails as Schema.Schema<
          Models.PaymentsPrimitivesPaymentRecordsResourcePaymentMethodDetails,
          any,
          any
        >
    )
  ),
  processor_details: Schema.suspend(
    (): Schema.Schema<Models.PaymentsPrimitivesPaymentRecordsResourceProcessorDetails, any, any> =>
      Models.PaymentsPrimitivesPaymentRecordsResourceProcessorDetails as Schema.Schema<
        Models.PaymentsPrimitivesPaymentRecordsResourceProcessorDetails,
        any,
        any
      >
  ),
  reported_by: Schema.Literal("self", "stripe"),
  shipping_details: Schema.NullOr(
    Schema.suspend(
      (): Schema.Schema<Models.PaymentsPrimitivesPaymentRecordsResourceShippingDetails, any, any> =>
        Models.PaymentsPrimitivesPaymentRecordsResourceShippingDetails as Schema.Schema<
          Models.PaymentsPrimitivesPaymentRecordsResourceShippingDetails,
          any,
          any
        >
    )
  )
})
export type PaymentRecord = typeof PaymentRecord.Type
