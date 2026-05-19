import * as Effect from "effect/Effect"
import * as Schema from "effect/Schema"

import { defineOperation } from "../../../core/operation.ts"
import * as Models from "../../models.ts"
import { PaddleClient } from "../../client.ts"

export const CreateBusinessInput = Schema.Struct({
  customer_id: Schema.String,
  name: Models.Name,
  company_number: Schema.optional(Schema.NullOr(Schema.String)),
  tax_identifier: Schema.optional(Schema.NullOr(Schema.String)),
  contacts: Schema.optional(Schema.NullOr(Schema.Array(Models.ContactsCreate))),
  custom_data: Schema.optional(Schema.NullOr(Models.CustomData)),
  import_meta: Schema.optional(Schema.NullOr(Models.ImportMeta)),
})
export type CreateBusinessInput = typeof CreateBusinessInput.Type

export const CreateBusinessOutput = Schema.Struct({
  data: Models.Business,
  meta: Models.Meta,
})
export type CreateBusinessOutput = typeof CreateBusinessOutput.Type

export const createBusinessOperation = defineOperation({
  id: "paddle.create-business",
  method: "POST",
  path: "/customers/{customer_id}/businesses",
  inputSchema: CreateBusinessInput,
  outputSchema: CreateBusinessOutput,
  status: [201],
  contentType: "json",
  pathParams: ["customer_id"],
  bodyParams: ["id", "name", "company_number", "tax_identifier", "contacts", "custom_data", "import_meta"]
})

/**
 * Create a business for a customer
 */
export const createBusiness = (input: CreateBusinessInput) =>
  PaddleClient.pipe(Effect.flatMap((client) => client.request(createBusinessOperation, input)))
