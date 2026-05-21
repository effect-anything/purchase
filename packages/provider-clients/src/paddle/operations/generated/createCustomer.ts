import * as Effect from "effect/Effect"
import * as Schema from "effect/Schema"

import { defineOperation } from "../../../core/operation.ts"
import { PaddleClient } from "../../client.ts"
import * as Models from "../../models.ts"

export const CreateCustomerInput = Schema.Struct({
  id: Schema.optional(Models.CustomerId),
  name: Schema.optional(Schema.NullOr(Models.Name)),
  email: Models.Email,
  marketing_consent: Schema.optional(Schema.Boolean),
  custom_data: Schema.optional(Schema.NullOr(Models.CustomData)),
  locale: Schema.optional(Schema.String),
  import_meta: Schema.optional(Schema.NullOr(Models.ImportMeta))
})
export type CreateCustomerInput = typeof CreateCustomerInput.Type

export const CreateCustomerOutput = Schema.Struct({
  data: Models.Customer,
  meta: Models.Meta
})
export type CreateCustomerOutput = typeof CreateCustomerOutput.Type

export const createCustomerOperation = defineOperation({
  id: "paddle.create-customer",
  method: "POST",
  path: "/customers",
  inputSchema: CreateCustomerInput,
  outputSchema: CreateCustomerOutput,
  status: [201],
  contentType: "json",
  bodyParams: ["id", "name", "email", "marketing_consent", "custom_data", "locale", "import_meta"]
})

/**
 * Create a customer
 */
export const createCustomer = (input: CreateCustomerInput) =>
  PaddleClient.pipe(Effect.flatMap((client) => client.request(createCustomerOperation, input)))
