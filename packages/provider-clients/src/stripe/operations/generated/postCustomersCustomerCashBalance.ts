import * as Effect from "effect/Effect"
import * as Schema from "effect/Schema"

import { defineOperation } from "../../../core/operation.ts"
import { StripeClient } from "../../client.ts"
import * as Models from "../../models.ts"

export const PostCustomersCustomerCashBalanceInput = Schema.Struct({
  customer: Schema.String,
  expand: Schema.optional(Schema.Array(Schema.String)),
  settings: Schema.optional(
    Schema.Struct({
      reconciliation_mode: Schema.optional(Schema.Literal("automatic", "manual", "merchant_default"))
    })
  )
})
export type PostCustomersCustomerCashBalanceInput = typeof PostCustomersCustomerCashBalanceInput.Type

export const PostCustomersCustomerCashBalanceOutput = Models.CashBalance
export type PostCustomersCustomerCashBalanceOutput = typeof PostCustomersCustomerCashBalanceOutput.Type

export const postCustomersCustomerCashBalanceOperation = defineOperation({
  id: "stripe.PostCustomersCustomerCashBalance",
  method: "POST",
  path: "/v1/customers/{customer}/cash_balance",
  inputSchema: PostCustomersCustomerCashBalanceInput,
  outputSchema: PostCustomersCustomerCashBalanceOutput,
  status: [200],
  contentType: "form",
  pathParams: ["customer"],
  bodyParams: ["expand", "settings"]
})

/**
 * Update a cash balance's settings
 */
export const postCustomersCustomerCashBalance = (input: PostCustomersCustomerCashBalanceInput) =>
  StripeClient.pipe(Effect.flatMap((client) => client.request(postCustomersCustomerCashBalanceOperation, input)))
