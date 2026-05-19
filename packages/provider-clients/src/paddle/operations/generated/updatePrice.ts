import * as Effect from "effect/Effect"
import * as Schema from "effect/Schema"

import { defineOperation } from "../../../core/operation.ts"
import * as Models from "../../models.ts"
import { PaddleClient } from "../../client.ts"

export const UpdatePriceInput = Schema.Struct({
  price_id: Schema.String,
  description: Schema.optional(Schema.String),
  type: Schema.optional(Models.CatalogType),
  name: Schema.optional(Schema.NullOr(Models.PriceName)),
  billing_cycle: Schema.optional(Schema.NullOr(Models.Duration)),
  trial_period: Schema.optional(Schema.NullOr(Models.Duration)),
  tax_mode: Schema.optional(Models.TaxMode),
  unit_price: Schema.optional(Models.Money),
  unit_price_overrides: Schema.optional(Schema.Array(Models.UnitPriceOverride)),
  quantity: Schema.optional(Models.PriceQuantity),
  status: Schema.optional(Models.Status),
  custom_data: Schema.optional(Schema.NullOr(Models.CustomData)),
})
export type UpdatePriceInput = typeof UpdatePriceInput.Type

export const UpdatePriceOutput = Schema.Struct({
  data: Models.Price,
  meta: Models.Meta,
})
export type UpdatePriceOutput = typeof UpdatePriceOutput.Type

export const updatePriceOperation = defineOperation({
  id: "paddle.update-price",
  method: "PATCH",
  path: "/prices/{price_id}",
  inputSchema: UpdatePriceInput,
  outputSchema: UpdatePriceOutput,
  status: [200],
  contentType: "json",
  pathParams: ["price_id"],
  bodyParams: ["description", "type", "name", "billing_cycle", "trial_period", "tax_mode", "unit_price", "unit_price_overrides", "quantity", "status", "custom_data"]
})

/**
 * Update a price
 */
export const updatePrice = (input: UpdatePriceInput) =>
  PaddleClient.pipe(Effect.flatMap((client) => client.request(updatePriceOperation, input)))
