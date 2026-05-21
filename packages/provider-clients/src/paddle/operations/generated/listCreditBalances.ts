import * as Effect from "effect/Effect"
import * as Schema from "effect/Schema"

import { defineOperation } from "../../../core/operation.ts"
import { PaddleClient } from "../../client.ts"
import * as Models from "../../models.ts"

export const ListCreditBalancesInput = Schema.Struct({
  customer_id: Schema.String,
  currency_code: Schema.optional(Schema.Array(Schema.String))
})
export type ListCreditBalancesInput = typeof ListCreditBalancesInput.Type

export const ListCreditBalancesOutput = Schema.Struct({
  data: Schema.Array(Models.CreditBalance),
  meta: Models.Meta
})
export type ListCreditBalancesOutput = typeof ListCreditBalancesOutput.Type

export const listCreditBalancesOperation = defineOperation({
  id: "paddle.list-credit-balances",
  method: "GET",
  path: "/customers/{customer_id}/credit-balances",
  inputSchema: ListCreditBalancesInput,
  outputSchema: ListCreditBalancesOutput,
  status: [200],
  contentType: "json",
  pathParams: ["customer_id"],
  queryParams: ["currency_code"]
})

/**
 * List credit balances for a customer
 */
export const listCreditBalances = (input: ListCreditBalancesInput) =>
  PaddleClient.pipe(Effect.flatMap((client) => client.request(listCreditBalancesOperation, input)))
