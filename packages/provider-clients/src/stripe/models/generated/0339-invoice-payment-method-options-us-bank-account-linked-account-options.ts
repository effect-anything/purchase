import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const InvoicePaymentMethodOptionsUsBankAccountLinkedAccountOptions = Schema.Struct({
  filters: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.InvoicePaymentMethodOptionsUsBankAccountLinkedAccountOptionsFilters, any, any> =>
        Models.InvoicePaymentMethodOptionsUsBankAccountLinkedAccountOptionsFilters as Schema.Schema<
          Models.InvoicePaymentMethodOptionsUsBankAccountLinkedAccountOptionsFilters,
          any,
          any
        >
    )
  ),
  permissions: Schema.optional(Schema.Array(Schema.Literal("balances", "ownership", "payment_method", "transactions"))),
  prefetch: Schema.NullOr(Schema.Array(Schema.Literal("balances", "ownership", "transactions")))
})
export type InvoicePaymentMethodOptionsUsBankAccountLinkedAccountOptions =
  typeof InvoicePaymentMethodOptionsUsBankAccountLinkedAccountOptions.Type
