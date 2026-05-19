import * as Effect from "effect/Effect"
import * as Schema from "effect/Schema"

import { defineOperation } from "../../../core/operation.ts"
import * as Models from "../../models.ts"
import { DodoClient } from "../../client.ts"

export const UpdateCreditEntitlementInput = Schema.Struct({
  id: Schema.String,
  currency: Schema.optional(Schema.NullOr(Schema.String)),
  description: Schema.optional(Schema.NullOr(Schema.String)),
  expires_after_days: Schema.optional(Schema.NullOr(Schema.Number)),
  max_rollover_count: Schema.optional(Schema.NullOr(Schema.Number)),
  name: Schema.optional(Schema.NullOr(Schema.String)),
  overage_behavior: Schema.optional(Models.CbbOverageBehavior),
  overage_enabled: Schema.optional(Schema.NullOr(Schema.Boolean)),
  overage_limit: Schema.optional(Schema.NullOr(Schema.Number)),
  price_per_unit: Schema.optional(Schema.NullOr(Schema.String)),
  rollover_enabled: Schema.optional(Schema.NullOr(Schema.Boolean)),
  rollover_percentage: Schema.optional(Schema.NullOr(Schema.Number)),
  rollover_timeframe_count: Schema.optional(Schema.NullOr(Schema.Number)),
  rollover_timeframe_interval: Schema.optional(Models.TimeInterval),
})
export type UpdateCreditEntitlementInput = typeof UpdateCreditEntitlementInput.Type

export const UpdateCreditEntitlementOutput = Schema.Unknown
export type UpdateCreditEntitlementOutput = typeof UpdateCreditEntitlementOutput.Type

export const updateCreditEntitlementOperation = defineOperation({
  id: "dodo.updateCreditEntitlement",
  method: "PATCH",
  path: "/credit-entitlements/{id}",
  inputSchema: UpdateCreditEntitlementInput,
  outputSchema: UpdateCreditEntitlementOutput,
  status: [200],
  contentType: "json",
  pathParams: ["id"],
  bodyParams: ["currency", "description", "expires_after_days", "max_rollover_count", "name", "overage_behavior", "overage_enabled", "overage_limit", "price_per_unit", "rollover_enabled", "rollover_percentage", "rollover_timeframe_count", "rollover_timeframe_interval", "unit"]
})

/**
 * Update credit entitlement
 */
export const updateCreditEntitlement = (input: UpdateCreditEntitlementInput) =>
  DodoClient.pipe(Effect.flatMap((client) => client.request(updateCreditEntitlementOperation, input)))
