import * as Effect from "effect/Effect"
import * as Schema from "effect/Schema"

import { defineOperation } from "../../../core/operation.ts"
import * as Models from "../../models.ts"
import { DodoClient } from "../../client.ts"

export const DeleteDiscountInput = Schema.Struct({
  discount_id: Schema.String,
})
export type DeleteDiscountInput = typeof DeleteDiscountInput.Type

export const DeleteDiscountOutput = Schema.Unknown
export type DeleteDiscountOutput = typeof DeleteDiscountOutput.Type

export const deleteDiscountOperation = defineOperation({
  id: "dodo.deleteDiscount",
  method: "DELETE",
  path: "/discounts/{discount_id}",
  inputSchema: DeleteDiscountInput,
  outputSchema: DeleteDiscountOutput,
  status: [200],
  contentType: "json",
  pathParams: ["discount_id"]
})

/**
 * Delete discount
 */
export const deleteDiscount = (input: DeleteDiscountInput) =>
  DodoClient.pipe(Effect.flatMap((client) => client.request(deleteDiscountOperation, input)))
