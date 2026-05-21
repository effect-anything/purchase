import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const IssuingCardWallets = Schema.Struct({
  apple_pay: Schema.suspend(
    (): Schema.Schema<Models.IssuingCardApplePay, any, any> =>
      Models.IssuingCardApplePay as Schema.Schema<Models.IssuingCardApplePay, any, any>
  ),
  google_pay: Schema.suspend(
    (): Schema.Schema<Models.IssuingCardGooglePay, any, any> =>
      Models.IssuingCardGooglePay as Schema.Schema<Models.IssuingCardGooglePay, any, any>
  ),
  primary_account_identifier: Schema.NullOr(Schema.String)
})
export type IssuingCardWallets = typeof IssuingCardWallets.Type
