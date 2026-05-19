import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const PaymentPagesCheckoutSessionNameCollection = Schema.Struct({
  business: Schema.optional(Schema.suspend((): typeof Models.PaymentPagesCheckoutSessionBusinessName => Models.PaymentPagesCheckoutSessionBusinessName)),
  individual: Schema.optional(Schema.suspend((): typeof Models.PaymentPagesCheckoutSessionIndividualName => Models.PaymentPagesCheckoutSessionIndividualName)),
})
export type PaymentPagesCheckoutSessionNameCollection = typeof PaymentPagesCheckoutSessionNameCollection.Type
