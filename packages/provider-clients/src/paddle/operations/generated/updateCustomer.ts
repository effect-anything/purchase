import * as Effect from "effect/Effect"
import * as Schema from "effect/Schema"

import { defineOperation } from "../../../core/operation.ts"
import * as Models from "../../models.ts"
import { PaddleClient } from "../../client.ts"

export const UpdateCustomerInput = Schema.Struct({
  customer_id: Schema.String,
  name: Schema.optional(Schema.NullOr(Models.Name)),
  email: Schema.optional(Models.Email),
  marketing_consent: Schema.optional(Schema.Boolean),
  status: Schema.optional(Models.Status),
  custom_data: Schema.optional(Schema.NullOr(Models.CustomData)),
  locale: Schema.optional(Schema.String),
  import_meta: Schema.optional(Schema.NullOr(Models.ImportMeta)),
})
export type UpdateCustomerInput = typeof UpdateCustomerInput.Type

export const UpdateCustomerOutput = Schema.Struct({
  data: Models.Customer,
  meta: Models.Meta,
})
export type UpdateCustomerOutput = typeof UpdateCustomerOutput.Type

export const updateCustomerOperation = defineOperation({
  id: "paddle.update-customer",
  method: "PATCH",
  path: "/customers/{customer_id}",
  inputSchema: UpdateCustomerInput,
  outputSchema: UpdateCustomerOutput,
  status: [200],
  contentType: "json",
  pathParams: ["customer_id"],
  bodyParams: ["name", "email", "marketing_consent", "status", "custom_data", "locale", "import_meta"]
})

/**
 * Update a customer
 */
export const updateCustomer = (input: UpdateCustomerInput) =>
  PaddleClient.pipe(Effect.flatMap((client) => client.request(updateCustomerOperation, input)))
