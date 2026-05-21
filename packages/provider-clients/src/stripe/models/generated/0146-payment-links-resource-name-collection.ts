import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const PaymentLinksResourceNameCollection = Schema.Struct({
  business: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.PaymentLinksResourceBusinessName, any, any> =>
        Models.PaymentLinksResourceBusinessName as Schema.Schema<Models.PaymentLinksResourceBusinessName, any, any>
    )
  ),
  individual: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.PaymentLinksResourceIndividualName, any, any> =>
        Models.PaymentLinksResourceIndividualName as Schema.Schema<Models.PaymentLinksResourceIndividualName, any, any>
    )
  )
})
export type PaymentLinksResourceNameCollection = typeof PaymentLinksResourceNameCollection.Type
