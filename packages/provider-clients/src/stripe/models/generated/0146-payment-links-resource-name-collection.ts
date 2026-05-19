import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const PaymentLinksResourceNameCollection = Schema.Struct({
  business: Schema.optional(Schema.suspend((): typeof Models.PaymentLinksResourceBusinessName => Models.PaymentLinksResourceBusinessName)),
  individual: Schema.optional(Schema.suspend((): typeof Models.PaymentLinksResourceIndividualName => Models.PaymentLinksResourceIndividualName)),
})
export type PaymentLinksResourceNameCollection = typeof PaymentLinksResourceNameCollection.Type
