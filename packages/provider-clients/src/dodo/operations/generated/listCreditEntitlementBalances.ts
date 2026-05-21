import * as Effect from "effect/Effect"
import * as Schema from "effect/Schema"

import { defineOperation } from "../../../core/operation.ts"
import { DodoClient } from "../../client.ts"
import * as Models from "../../models.ts"

export const ListCreditEntitlementBalancesInput = Schema.Struct({
  credit_entitlement_id: Schema.String,
  page_number: Schema.optional(Schema.Number),
  page_size: Schema.optional(Schema.Number),
  customer_id: Schema.optional(Schema.String)
})
export type ListCreditEntitlementBalancesInput = typeof ListCreditEntitlementBalancesInput.Type

export const ListCreditEntitlementBalancesOutput = Models.CustomerCreditBalanceListResponse
export type ListCreditEntitlementBalancesOutput = typeof ListCreditEntitlementBalancesOutput.Type

export const listCreditEntitlementBalancesOperation = defineOperation({
  id: "dodo.listCreditEntitlementBalances",
  method: "GET",
  path: "/credit-entitlements/{credit_entitlement_id}/balances",
  inputSchema: ListCreditEntitlementBalancesInput,
  outputSchema: ListCreditEntitlementBalancesOutput,
  status: [200],
  contentType: "json",
  pathParams: ["credit_entitlement_id"],
  queryParams: ["page_number", "page_size", "customer_id"]
})

/**
 * List credit entitlement balances
 */
export const listCreditEntitlementBalances = (input: ListCreditEntitlementBalancesInput) =>
  DodoClient.pipe(Effect.flatMap((client) => client.request(listCreditEntitlementBalancesOperation, input)))
