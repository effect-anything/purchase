import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export type BillingCreditGrantsResourceBalanceCredit = {
  readonly amount: Models.BillingCreditGrantsResourceAmount
  readonly credits_application_invoice_voided: Models.BillingCreditGrantsResourceBalanceCreditsApplicationInvoiceVoided | null
  readonly type: "credits_application_invoice_voided" | "credits_granted"
}

export const BillingCreditGrantsResourceBalanceCredit = Schema.Struct({
  amount: Schema.suspend(
    (): Schema.Schema<Models.BillingCreditGrantsResourceAmount, any, any> =>
      Models.BillingCreditGrantsResourceAmount as Schema.Schema<Models.BillingCreditGrantsResourceAmount, any, any>
  ),
  credits_application_invoice_voided: Schema.NullOr(
    Schema.suspend(
      (): Schema.Schema<Models.BillingCreditGrantsResourceBalanceCreditsApplicationInvoiceVoided, any, any> =>
        Models.BillingCreditGrantsResourceBalanceCreditsApplicationInvoiceVoided as Schema.Schema<
          Models.BillingCreditGrantsResourceBalanceCreditsApplicationInvoiceVoided,
          any,
          any
        >
    )
  ),
  type: Schema.Literal("credits_application_invoice_voided", "credits_granted")
})
