import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const IssuingCardWallets = Schema.Struct({
  apple_pay: Schema.suspend((): typeof Models.IssuingCardApplePay => Models.IssuingCardApplePay),
  google_pay: Schema.suspend((): typeof Models.IssuingCardGooglePay => Models.IssuingCardGooglePay),
  primary_account_identifier: Schema.NullOr(Schema.String),
})
export type IssuingCardWallets = typeof IssuingCardWallets.Type
