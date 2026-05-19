import * as Effect from "effect/Effect"
import * as Schema from "effect/Schema"

import { defineOperation } from "../../../core/operation.ts"
import * as Models from "../../models.ts"
import { DodoClient } from "../../client.ts"

export const GetCreditEntitlementInput = Schema.Struct({
  id: Schema.String,
})
export type GetCreditEntitlementInput = typeof GetCreditEntitlementInput.Type

export const GetCreditEntitlementOutput = Models.CreditEntitlement
export type GetCreditEntitlementOutput = typeof GetCreditEntitlementOutput.Type

export const getCreditEntitlementOperation = defineOperation({
  id: "dodo.getCreditEntitlement",
  method: "GET",
  path: "/credit-entitlements/{id}",
  inputSchema: GetCreditEntitlementInput,
  outputSchema: GetCreditEntitlementOutput,
  status: [200],
  contentType: "json",
  pathParams: ["id"]
})

/**
 * Get credit entitlement
 */
export const getCreditEntitlement = (input: GetCreditEntitlementInput) =>
  DodoClient.pipe(Effect.flatMap((client) => client.request(getCreditEntitlementOperation, input)))
