import * as Effect from "effect/Effect"
import * as Schema from "effect/Schema"

import { defineOperation } from "../../../core/operation.ts"
import * as Models from "../../models.ts"
import { PaddleClient } from "../../client.ts"

export const CreateAddressInput = Schema.Struct({
  customer_id: Schema.String,
  description: Schema.optional(Schema.NullOr(Schema.String)),
  first_line: Schema.optional(Schema.NullOr(Schema.String)),
  second_line: Schema.optional(Schema.NullOr(Schema.String)),
  city: Schema.optional(Schema.NullOr(Schema.String)),
  postal_code: Schema.optional(Schema.NullOr(Schema.String)),
  region: Schema.optional(Schema.NullOr(Schema.String)),
  country_code: Models.CountryCode,
  custom_data: Schema.optional(Schema.NullOr(Models.CustomData)),
  import_meta: Schema.optional(Schema.NullOr(Models.ImportMeta)),
})
export type CreateAddressInput = typeof CreateAddressInput.Type

export const CreateAddressOutput = Schema.Struct({
  data: Models.Address,
  meta: Models.Meta,
})
export type CreateAddressOutput = typeof CreateAddressOutput.Type

export const createAddressOperation = defineOperation({
  id: "paddle.create-address",
  method: "POST",
  path: "/customers/{customer_id}/addresses",
  inputSchema: CreateAddressInput,
  outputSchema: CreateAddressOutput,
  status: [201],
  contentType: "json",
  pathParams: ["customer_id"],
  bodyParams: ["id", "description", "first_line", "second_line", "city", "postal_code", "region", "country_code", "custom_data", "import_meta"]
})

/**
 * Create an address for a customer
 */
export const createAddress = (input: CreateAddressInput) =>
  PaddleClient.pipe(Effect.flatMap((client) => client.request(createAddressOperation, input)))
