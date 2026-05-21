import * as Effect from "effect/Effect"
import * as Schema from "effect/Schema"

import { defineOperation } from "../../../core/operation.ts"
import { DodoClient } from "../../client.ts"
import * as Models from "../../models.ts"

export const GetDiscountByCodeInput = Schema.Struct({
  code: Schema.String
})
export type GetDiscountByCodeInput = typeof GetDiscountByCodeInput.Type

export const GetDiscountByCodeOutput = Models.Discount
export type GetDiscountByCodeOutput = typeof GetDiscountByCodeOutput.Type

export const getDiscountByCodeOperation = defineOperation({
  id: "dodo.getDiscountByCode",
  method: "GET",
  path: "/discounts/code/{code}",
  inputSchema: GetDiscountByCodeInput,
  outputSchema: GetDiscountByCodeOutput,
  status: [200],
  contentType: "json",
  pathParams: ["code"]
})

/**
 * Get discount by code
 */
export const getDiscountByCode = (input: GetDiscountByCodeInput) =>
  DodoClient.pipe(Effect.flatMap((client) => client.request(getDiscountByCodeOperation, input)))
