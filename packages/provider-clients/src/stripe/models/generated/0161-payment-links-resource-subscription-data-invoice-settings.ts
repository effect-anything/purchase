import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const PaymentLinksResourceSubscriptionDataInvoiceSettings = Schema.Struct({
  issuer: Schema.suspend(
    (): Schema.Schema<Models.ConnectAccountReference, any, any> =>
      Models.ConnectAccountReference as Schema.Schema<Models.ConnectAccountReference, any, any>
  )
})
export type PaymentLinksResourceSubscriptionDataInvoiceSettings =
  typeof PaymentLinksResourceSubscriptionDataInvoiceSettings.Type
