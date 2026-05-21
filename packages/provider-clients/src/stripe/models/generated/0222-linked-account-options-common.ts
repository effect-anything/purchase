import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const LinkedAccountOptionsCommon = Schema.Struct({
  filters: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<
        Models.PaymentFlowsPrivatePaymentMethodsFinancialConnectionsCommonLinkedAccountOptionsFilters,
        any,
        any
      > =>
        Models.PaymentFlowsPrivatePaymentMethodsFinancialConnectionsCommonLinkedAccountOptionsFilters as Schema.Schema<
          Models.PaymentFlowsPrivatePaymentMethodsFinancialConnectionsCommonLinkedAccountOptionsFilters,
          any,
          any
        >
    )
  ),
  permissions: Schema.optional(Schema.Array(Schema.Literal("balances", "ownership", "payment_method", "transactions"))),
  prefetch: Schema.NullOr(Schema.Array(Schema.Literal("balances", "ownership", "transactions"))),
  return_url: Schema.optional(Schema.String)
})
export type LinkedAccountOptionsCommon = typeof LinkedAccountOptionsCommon.Type
