import * as Effect from "effect/Effect"
import * as Schema from "effect/Schema"

import { defineOperation } from "../../../core/operation.ts"
import * as Models from "../../models.ts"
import { DodoClient } from "../../client.ts"

export const CreateCreditEntitlementInput = Schema.Struct({
  name: Schema.String,
  overage_enabled: Schema.Boolean,
  precision: Schema.Number,
  rollover_enabled: Schema.Boolean,
  unit: Schema.String,
  currency: Schema.optional(Schema.NullOr(Schema.String)),
  description: Schema.optional(Schema.NullOr(Schema.String)),
  expires_after_days: Schema.optional(Schema.NullOr(Schema.Number)),
  max_rollover_count: Schema.optional(Schema.NullOr(Schema.Number)),
  overage_behavior: Schema.optional(Models.CbbOverageBehavior),
  overage_limit: Schema.optional(Schema.NullOr(Schema.Number)),
  price_per_unit: Schema.optional(Schema.NullOr(Schema.String)),
  rollover_percentage: Schema.optional(Schema.NullOr(Schema.Number)),
  rollover_timeframe_count: Schema.optional(Schema.NullOr(Schema.Number)),
  rollover_timeframe_interval: Schema.optional(Models.TimeInterval),
})
export type CreateCreditEntitlementInput = typeof CreateCreditEntitlementInput.Type

export const CreateCreditEntitlementOutput = Models.CreditEntitlement
export type CreateCreditEntitlementOutput = typeof CreateCreditEntitlementOutput.Type

export const createCreditEntitlementOperation = defineOperation({
  id: "dodo.createCreditEntitlement",
  method: "POST",
  path: "/credit-entitlements",
  inputSchema: CreateCreditEntitlementInput,
  outputSchema: CreateCreditEntitlementOutput,
  status: [201],
  contentType: "json",
  bodyParams: ["name", "overage_enabled", "precision", "rollover_enabled", "unit", "currency", "description", "expires_after_days", "max_rollover_count", "overage_behavior", "overage_limit", "price_per_unit", "rollover_percentage", "rollover_timeframe_count", "rollover_timeframe_interval"]
})

/**
 * Create credit entitlement
 */
export const createCreditEntitlement = (input: CreateCreditEntitlementInput) =>
  DodoClient.pipe(Effect.flatMap((client) => client.request(createCreditEntitlementOperation, input)))
