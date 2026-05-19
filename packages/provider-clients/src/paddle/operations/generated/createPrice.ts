import * as Effect from "effect/Effect"
import * as Schema from "effect/Schema"

import { defineOperation } from "../../../core/operation.ts"
import * as Models from "../../models.ts"
import { PaddleClient } from "../../client.ts"

export const CreatePriceInput = Schema.Struct({
  id: Schema.optional(Models.PriceId),
  description: Schema.String,
  type: Schema.optional(Models.CatalogType),
  name: Schema.optional(Schema.NullOr(Models.PriceName)),
  product_id: Models.ProductId,
  billing_cycle: Schema.optional(Schema.NullOr(Models.Duration)),
  trial_period: Schema.optional(Schema.NullOr(Models.PriceTrialDurationCreate)),
  tax_mode: Schema.optional(Models.TaxMode),
  unit_price: Models.Money,
  unit_price_overrides: Schema.optional(Schema.Array(Models.UnitPriceOverride)),
  quantity: Schema.optional(Models.PriceQuantity),
  custom_data: Schema.optional(Schema.NullOr(Models.CustomData)),
  import_meta: Schema.optional(Schema.NullOr(Models.ImportMeta)),
})
export type CreatePriceInput = typeof CreatePriceInput.Type

export const CreatePriceOutput = Schema.Struct({
  data: Models.Price,
  meta: Models.Meta,
})
export type CreatePriceOutput = typeof CreatePriceOutput.Type

export const createPriceOperation = defineOperation({
  id: "paddle.create-price",
  method: "POST",
  path: "/prices",
  inputSchema: CreatePriceInput,
  outputSchema: CreatePriceOutput,
  status: [201],
  contentType: "json",
  bodyParams: ["id", "description", "type", "name", "product_id", "billing_cycle", "trial_period", "tax_mode", "unit_price", "unit_price_overrides", "quantity", "custom_data", "import_meta"]
})

/**
 * Create a price
 */
export const createPrice = (input: CreatePriceInput) =>
  PaddleClient.pipe(Effect.flatMap((client) => client.request(createPriceOperation, input)))
