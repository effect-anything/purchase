import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const PaymentFlowsPrivatePaymentMethodsFinancialConnectionsCommonLinkedAccountOptionsFilters = Schema.Struct({
  account_subcategories: Schema.optional(Schema.Array(Schema.Literal("checking", "savings"))),
})
export type PaymentFlowsPrivatePaymentMethodsFinancialConnectionsCommonLinkedAccountOptionsFilters = typeof PaymentFlowsPrivatePaymentMethodsFinancialConnectionsCommonLinkedAccountOptionsFilters.Type
