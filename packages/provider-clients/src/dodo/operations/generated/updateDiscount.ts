import * as Effect from "effect/Effect"
import * as Schema from "effect/Schema"

import { defineOperation } from "../../../core/operation.ts"
import { DodoClient } from "../../client.ts"
import * as Models from "../../models.ts"

export const UpdateDiscountInput = Schema.Struct({
  discount_id: Schema.String,
  amount: Schema.optional(Schema.NullOr(Schema.Number)),
  code: Schema.optional(Schema.NullOr(Schema.String)),
  expires_at: Schema.optional(Schema.NullOr(Schema.String)),
  metadata: Schema.optional(Models.Metadata),
  name: Schema.optional(Schema.NullOr(Schema.String)),
  preserve_on_plan_change: Schema.optional(Schema.NullOr(Schema.Boolean)),
  restricted_to: Schema.optional(Schema.NullOr(Schema.Array(Schema.String))),
  subscription_cycles: Schema.optional(Schema.NullOr(Schema.Number)),
  type: Schema.optional(Models.DiscountType),
  usage_limit: Schema.optional(Schema.NullOr(Schema.Number))
})
export type UpdateDiscountInput = typeof UpdateDiscountInput.Type

export const UpdateDiscountOutput = Models.Discount
export type UpdateDiscountOutput = typeof UpdateDiscountOutput.Type

export const updateDiscountOperation = defineOperation({
  id: "dodo.updateDiscount",
  method: "PATCH",
  path: "/discounts/{discount_id}",
  inputSchema: UpdateDiscountInput,
  outputSchema: UpdateDiscountOutput,
  status: [200],
  contentType: "json",
  pathParams: ["discount_id"],
  bodyParams: [
    "amount",
    "code",
    "expires_at",
    "metadata",
    "name",
    "preserve_on_plan_change",
    "restricted_to",
    "subscription_cycles",
    "type",
    "usage_limit"
  ]
})

/**
 * Update discount
 */
export const updateDiscount = (input: UpdateDiscountInput) =>
  DodoClient.pipe(Effect.flatMap((client) => client.request(updateDiscountOperation, input)))
