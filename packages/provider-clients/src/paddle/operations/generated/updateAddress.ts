import * as Effect from "effect/Effect"
import * as Schema from "effect/Schema"

import { defineOperation } from "../../../core/operation.ts"
import * as Models from "../../models.ts"
import { PaddleClient } from "../../client.ts"

export const UpdateAddressInput = Schema.Struct({
  address_id: Schema.String,
  customer_id: Schema.String,
  description: Schema.optional(Schema.NullOr(Schema.String)),
  first_line: Schema.optional(Schema.NullOr(Schema.String)),
  second_line: Schema.optional(Schema.NullOr(Schema.String)),
  city: Schema.optional(Schema.NullOr(Schema.String)),
  postal_code: Schema.optional(Schema.NullOr(Schema.String)),
  region: Schema.optional(Schema.NullOr(Schema.String)),
  country_code: Schema.optional(Models.CountryCode),
  custom_data: Schema.optional(Schema.NullOr(Models.CustomData)),
  status: Schema.optional(Models.Status),
})
export type UpdateAddressInput = typeof UpdateAddressInput.Type

export const UpdateAddressOutput = Schema.Struct({
  data: Models.Address,
  meta: Models.Meta,
})
export type UpdateAddressOutput = typeof UpdateAddressOutput.Type

export const updateAddressOperation = defineOperation({
  id: "paddle.update-address",
  method: "PATCH",
  path: "/customers/{customer_id}/addresses/{address_id}",
  inputSchema: UpdateAddressInput,
  outputSchema: UpdateAddressOutput,
  status: [200],
  contentType: "json",
  pathParams: ["address_id", "customer_id"],
  bodyParams: ["description", "first_line", "second_line", "city", "postal_code", "region", "country_code", "custom_data", "status"]
})

/**
 * Update an address for a customer
 */
export const updateAddress = (input: UpdateAddressInput) =>
  PaddleClient.pipe(Effect.flatMap((client) => client.request(updateAddressOperation, input)))
