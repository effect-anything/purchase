import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const PaymentsPrimitivesPaymentRecordsResourceProcessorDetails = Schema.Struct({
  custom: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<
        Models.PaymentsPrimitivesPaymentRecordsResourceProcessorDetailsResourceCustomDetails,
        any,
        any
      > =>
        Models.PaymentsPrimitivesPaymentRecordsResourceProcessorDetailsResourceCustomDetails as Schema.Schema<
          Models.PaymentsPrimitivesPaymentRecordsResourceProcessorDetailsResourceCustomDetails,
          any,
          any
        >
    )
  ),
  type: Schema.Literal("custom")
})
export type PaymentsPrimitivesPaymentRecordsResourceProcessorDetails =
  typeof PaymentsPrimitivesPaymentRecordsResourceProcessorDetails.Type
