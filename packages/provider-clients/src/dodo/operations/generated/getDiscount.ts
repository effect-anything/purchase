import * as Effect from "effect/Effect"
import * as Schema from "effect/Schema"

import { defineOperation } from "../../../core/operation.ts"
import * as Models from "../../models.ts"
import { DodoClient } from "../../client.ts"

export const GetDiscountInput = Schema.Struct({
  discount_id: Schema.String,
})
export type GetDiscountInput = typeof GetDiscountInput.Type

export const GetDiscountOutput = Models.Discount
export type GetDiscountOutput = typeof GetDiscountOutput.Type

export const getDiscountOperation = defineOperation({
  id: "dodo.getDiscount",
  method: "GET",
  path: "/discounts/{discount_id}",
  inputSchema: GetDiscountInput,
  outputSchema: GetDiscountOutput,
  status: [200],
  contentType: "json",
  pathParams: ["discount_id"]
})

/**
 * Get discount
 */
export const getDiscount = (input: GetDiscountInput) =>
  DodoClient.pipe(Effect.flatMap((client) => client.request(getDiscountOperation, input)))
