import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const PaymentsPrimitivesPaymentRecordsResourceProcessorDetails = Schema.Struct({
  custom: Schema.optional(Schema.suspend((): typeof Models.PaymentsPrimitivesPaymentRecordsResourceProcessorDetailsResourceCustomDetails => Models.PaymentsPrimitivesPaymentRecordsResourceProcessorDetailsResourceCustomDetails)),
  type: Schema.Literal("custom"),
})
export type PaymentsPrimitivesPaymentRecordsResourceProcessorDetails = typeof PaymentsPrimitivesPaymentRecordsResourceProcessorDetails.Type
