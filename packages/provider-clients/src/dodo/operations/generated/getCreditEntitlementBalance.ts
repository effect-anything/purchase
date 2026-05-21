import * as Effect from "effect/Effect"
import * as Schema from "effect/Schema"

import { defineOperation } from "../../../core/operation.ts"
import { DodoClient } from "../../client.ts"
import * as Models from "../../models.ts"

export const GetCreditEntitlementBalanceInput = Schema.Struct({
  credit_entitlement_id: Schema.String,
  customer_id: Schema.String
})
export type GetCreditEntitlementBalanceInput = typeof GetCreditEntitlementBalanceInput.Type

export const GetCreditEntitlementBalanceOutput = Models.CustomerCreditBalance
export type GetCreditEntitlementBalanceOutput = typeof GetCreditEntitlementBalanceOutput.Type

export const getCreditEntitlementBalanceOperation = defineOperation({
  id: "dodo.getCreditEntitlementBalance",
  method: "GET",
  path: "/credit-entitlements/{credit_entitlement_id}/balances/{customer_id}",
  inputSchema: GetCreditEntitlementBalanceInput,
  outputSchema: GetCreditEntitlementBalanceOutput,
  status: [200],
  contentType: "json",
  pathParams: ["credit_entitlement_id", "customer_id"]
})

/**
 * Get customer credit balance
 */
export const getCreditEntitlementBalance = (input: GetCreditEntitlementBalanceInput) =>
  DodoClient.pipe(Effect.flatMap((client) => client.request(getCreditEntitlementBalanceOperation, input)))
