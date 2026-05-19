import * as Effect from "effect/Effect"
import * as Schema from "effect/Schema"

import { defineOperation } from "../../../core/operation.ts"
import * as Models from "../../models.ts"
import { CreemClient } from "../../client.ts"

export const CreateProductInput = Schema.Struct({
  name: Schema.String,
  description: Schema.String,
  image_url: Schema.optional(Schema.String),
  price: Schema.Number,
  currency: Models.ProductCurrency,
  billing_type: Models.ProductRequestBillingType,
  billing_period: Schema.optional(Models.ProductRequestBillingPeriod),
  tax_mode: Schema.optional(Models.TaxMode),
  tax_category: Schema.optional(Models.TaxCategory),
  default_success_url: Schema.optional(Schema.String),
  custom_fields: Schema.optional(Schema.Array(Models.CustomFieldRequestEntity)),
  custom_field: Schema.optional(Schema.Array(Models.CustomFieldRequestEntity)),
  abandoned_cart_recovery_enabled: Schema.optional(Schema.Boolean),
})
export type CreateProductInput = typeof CreateProductInput.Type

export const CreateProductOutput = Models.ProductEntity
export type CreateProductOutput = typeof CreateProductOutput.Type

export const createProductOperation = defineOperation({
  id: "creem.createProduct",
  method: "POST",
  path: "/products",
  inputSchema: CreateProductInput,
  outputSchema: CreateProductOutput,
  status: [200],
  contentType: "json",
  bodyParams: ["name", "description", "image_url", "price", "currency", "billing_type", "billing_period", "tax_mode", "tax_category", "default_success_url", "custom_fields", "custom_field", "abandoned_cart_recovery_enabled"]
})

/**
 * Creates a new product.
 */
export const createProduct = (input: CreateProductInput) =>
  CreemClient.pipe(Effect.flatMap((client) => client.request(createProductOperation, input)))
