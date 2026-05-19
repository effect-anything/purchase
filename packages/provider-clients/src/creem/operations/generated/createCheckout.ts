import * as Effect from "effect/Effect"
import * as Schema from "effect/Schema"

import { defineOperation } from "../../../core/operation.ts"
import * as Models from "../../models.ts"
import { CreemClient } from "../../client.ts"

export const CreateCheckoutInput = Schema.Struct({
  request_id: Schema.optional(Schema.String),
  product_id: Schema.String,
  units: Schema.optional(Schema.Number),
  discount_code: Schema.optional(Schema.String),
  customer: Schema.optional(Models.CustomerRequestEntity),
  custom_fields: Schema.optional(Schema.Array(Models.CustomFieldRequestEntity)),
  custom_field: Schema.optional(Schema.Array(Models.CustomFieldRequestEntity)),
  success_url: Schema.optional(Schema.String),
  metadata: Schema.optional(Schema.Record({ key: Schema.String, value: Schema.Unknown })),
})
export type CreateCheckoutInput = typeof CreateCheckoutInput.Type

export const CreateCheckoutOutput = Models.CheckoutEntity
export type CreateCheckoutOutput = typeof CreateCheckoutOutput.Type

export const createCheckoutOperation = defineOperation({
  id: "creem.createCheckout",
  method: "POST",
  path: "/checkouts",
  inputSchema: CreateCheckoutInput,
  outputSchema: CreateCheckoutOutput,
  status: [200],
  contentType: "json",
  bodyParams: ["request_id", "product_id", "units", "discount_code", "customer", "custom_fields", "custom_field", "success_url", "metadata"]
})

/**
 * Creates a new checkout session.
 */
export const createCheckout = (input: CreateCheckoutInput) =>
  CreemClient.pipe(Effect.flatMap((client) => client.request(createCheckoutOperation, input)))
