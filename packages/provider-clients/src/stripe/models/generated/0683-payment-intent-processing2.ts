import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const PaymentIntentProcessing2 = Schema.Struct({
  card: Schema.optional(Schema.suspend((): typeof Models.PaymentIntentCardProcessing => Models.PaymentIntentCardProcessing)),
  type: Schema.Literal("card"),
})
export type PaymentIntentProcessing2 = typeof PaymentIntentProcessing2.Type
