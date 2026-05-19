import * as Effect from "effect/Effect"
import * as Schema from "effect/Schema"

import { defineOperation } from "../../../core/operation.ts"
import * as Models from "../../models.ts"
import { DodoClient } from "../../client.ts"

export const CreateDiscountInput = Schema.Struct({
  amount: Schema.Number,
  type: Models.DiscountType,
  code: Schema.optional(Schema.NullOr(Schema.String)),
  expires_at: Schema.optional(Schema.NullOr(Schema.String)),
  metadata: Schema.optional(Models.Metadata),
  name: Schema.optional(Schema.NullOr(Schema.String)),
  preserve_on_plan_change: Schema.optional(Schema.Boolean),
  restricted_to: Schema.optional(Schema.NullOr(Schema.Array(Schema.String))),
  subscription_cycles: Schema.optional(Schema.NullOr(Schema.Number)),
  usage_limit: Schema.optional(Schema.NullOr(Schema.Number)),
})
export type CreateDiscountInput = typeof CreateDiscountInput.Type

export const CreateDiscountOutput = Models.Discount
export type CreateDiscountOutput = typeof CreateDiscountOutput.Type

export const createDiscountOperation = defineOperation({
  id: "dodo.createDiscount",
  method: "POST",
  path: "/discounts",
  inputSchema: CreateDiscountInput,
  outputSchema: CreateDiscountOutput,
  status: [200],
  contentType: "json",
  bodyParams: ["amount", "type", "code", "expires_at", "metadata", "name", "preserve_on_plan_change", "restricted_to", "subscription_cycles", "usage_limit"]
})

/**
 * Create discount
 */
export const createDiscount = (input: CreateDiscountInput) =>
  DodoClient.pipe(Effect.flatMap((client) => client.request(createDiscountOperation, input)))
