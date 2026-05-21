import * as Effect from "effect/Effect"
import * as Schema from "effect/Schema"

import { defineOperation } from "../../../core/operation.ts"
import { DodoClient } from "../../client.ts"
import * as Models from "../../models.ts"

export const ListDiscountsInput = Schema.Struct({
  page_number: Schema.optional(Schema.Number),
  page_size: Schema.optional(Schema.Number),
  active: Schema.optional(Schema.Boolean),
  code: Schema.optional(Schema.String),
  discount_type: Schema.optional(Models.DiscountType),
  product_id: Schema.optional(Schema.String)
})
export type ListDiscountsInput = typeof ListDiscountsInput.Type

export const ListDiscountsOutput = Models.DiscountListResponse
export type ListDiscountsOutput = typeof ListDiscountsOutput.Type

export const listDiscountsOperation = defineOperation({
  id: "dodo.listDiscounts",
  method: "GET",
  path: "/discounts",
  inputSchema: ListDiscountsInput,
  outputSchema: ListDiscountsOutput,
  status: [200],
  contentType: "json",
  queryParams: ["page_number", "page_size", "active", "code", "discount_type", "product_id"]
})

/**
 * List discounts
 */
export const listDiscounts = (input: ListDiscountsInput) =>
  DodoClient.pipe(Effect.flatMap((client) => client.request(listDiscountsOperation, input)))
