import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const InvoicePaymentMethodOptionsUsBankAccountLinkedAccountOptions = Schema.Struct({
  filters: Schema.optional(Schema.suspend((): typeof Models.InvoicePaymentMethodOptionsUsBankAccountLinkedAccountOptionsFilters => Models.InvoicePaymentMethodOptionsUsBankAccountLinkedAccountOptionsFilters)),
  permissions: Schema.optional(Schema.Array(Schema.Literal("balances", "ownership", "payment_method", "transactions"))),
  prefetch: Schema.NullOr(Schema.Array(Schema.Literal("balances", "ownership", "transactions"))),
})
export type InvoicePaymentMethodOptionsUsBankAccountLinkedAccountOptions = typeof InvoicePaymentMethodOptionsUsBankAccountLinkedAccountOptions.Type
