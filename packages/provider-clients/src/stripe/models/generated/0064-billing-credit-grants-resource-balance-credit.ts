import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const BillingCreditGrantsResourceBalanceCredit = Schema.Struct({
  amount: Schema.suspend((): typeof Models.BillingCreditGrantsResourceAmount => Models.BillingCreditGrantsResourceAmount),
  credits_application_invoice_voided: Schema.NullOr(Schema.suspend((): typeof Models.BillingCreditGrantsResourceBalanceCreditsApplicationInvoiceVoided => Models.BillingCreditGrantsResourceBalanceCreditsApplicationInvoiceVoided)),
  type: Schema.Literal("credits_application_invoice_voided", "credits_granted"),
})
export type BillingCreditGrantsResourceBalanceCredit = typeof BillingCreditGrantsResourceBalanceCredit.Type
