import * as Effect from "effect/Effect"
import * as Schema from "effect/Schema"

import { defineOperation } from "../../../core/operation.ts"
import * as Models from "../../models.ts"
import { DodoClient } from "../../client.ts"

export const DeleteCreditEntitlementInput = Schema.Struct({
  id: Schema.String,
})
export type DeleteCreditEntitlementInput = typeof DeleteCreditEntitlementInput.Type

export const DeleteCreditEntitlementOutput = Schema.Unknown
export type DeleteCreditEntitlementOutput = typeof DeleteCreditEntitlementOutput.Type

export const deleteCreditEntitlementOperation = defineOperation({
  id: "dodo.deleteCreditEntitlement",
  method: "DELETE",
  path: "/credit-entitlements/{id}",
  inputSchema: DeleteCreditEntitlementInput,
  outputSchema: DeleteCreditEntitlementOutput,
  status: [200],
  contentType: "json",
  pathParams: ["id"]
})

/**
 * Delete credit entitlement
 */
export const deleteCreditEntitlement = (input: DeleteCreditEntitlementInput) =>
  DodoClient.pipe(Effect.flatMap((client) => client.request(deleteCreditEntitlementOperation, input)))
