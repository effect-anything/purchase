import * as Effect from "effect/Effect"
import * as Schema from "effect/Schema"

import { defineOperation } from "../../../core/operation.ts"
import { DodoClient } from "../../client.ts"
import * as Models from "../../models.ts"

export const UndeleteCreditEntitlementInput = Schema.Struct({
  id: Schema.String
})
export type UndeleteCreditEntitlementInput = typeof UndeleteCreditEntitlementInput.Type

export const UndeleteCreditEntitlementOutput = Schema.Unknown
export type UndeleteCreditEntitlementOutput = typeof UndeleteCreditEntitlementOutput.Type

export const undeleteCreditEntitlementOperation = defineOperation({
  id: "dodo.undeleteCreditEntitlement",
  method: "POST",
  path: "/credit-entitlements/{id}/undelete",
  inputSchema: UndeleteCreditEntitlementInput,
  outputSchema: UndeleteCreditEntitlementOutput,
  status: [200],
  contentType: "json",
  pathParams: ["id"]
})

/**
 * Undelete credit entitlement
 */
export const undeleteCreditEntitlement = (input: UndeleteCreditEntitlementInput) =>
  DodoClient.pipe(Effect.flatMap((client) => client.request(undeleteCreditEntitlementOperation, input)))
