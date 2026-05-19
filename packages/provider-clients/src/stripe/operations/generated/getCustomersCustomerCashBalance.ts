import * as Effect from "effect/Effect"
import * as Schema from "effect/Schema"

import { defineOperation } from "../../../core/operation.ts"
import * as Models from "../../models.ts"
import { StripeClient } from "../../client.ts"

export const GetCustomersCustomerCashBalanceInput = Schema.Struct({
  customer: Schema.String,
  expand: Schema.optional(Schema.Array(Schema.String)),
})
export type GetCustomersCustomerCashBalanceInput = typeof GetCustomersCustomerCashBalanceInput.Type

export const GetCustomersCustomerCashBalanceOutput = Models.CashBalance
export type GetCustomersCustomerCashBalanceOutput = typeof GetCustomersCustomerCashBalanceOutput.Type

export const getCustomersCustomerCashBalanceOperation = defineOperation({
  id: "stripe.GetCustomersCustomerCashBalance",
  method: "GET",
  path: "/v1/customers/{customer}/cash_balance",
  inputSchema: GetCustomersCustomerCashBalanceInput,
  outputSchema: GetCustomersCustomerCashBalanceOutput,
  status: [200],
  contentType: "form",
  pathParams: ["customer"],
  queryParams: ["expand"]
})

/**
 * Retrieve a cash balance
 */
export const getCustomersCustomerCashBalance = (input: GetCustomersCustomerCashBalanceInput) =>
  StripeClient.pipe(Effect.flatMap((client) => client.request(getCustomersCustomerCashBalanceOperation, input)))
