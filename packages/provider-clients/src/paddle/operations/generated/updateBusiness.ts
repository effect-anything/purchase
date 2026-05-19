import * as Effect from "effect/Effect"
import * as Schema from "effect/Schema"

import { defineOperation } from "../../../core/operation.ts"
import * as Models from "../../models.ts"
import { PaddleClient } from "../../client.ts"

export const UpdateBusinessInput = Schema.Struct({
  business_id: Schema.String,
  customer_id: Schema.String,
  name: Schema.optional(Models.Name),
  company_number: Schema.optional(Schema.NullOr(Schema.String)),
  tax_identifier: Schema.optional(Schema.NullOr(Schema.String)),
  status: Schema.optional(Models.Status),
  contacts: Schema.optional(Schema.NullOr(Schema.Array(Models.ContactsCreate))),
  custom_data: Schema.optional(Schema.NullOr(Models.CustomData)),
})
export type UpdateBusinessInput = typeof UpdateBusinessInput.Type

export const UpdateBusinessOutput = Schema.Struct({
  data: Models.Business,
  meta: Models.Meta,
})
export type UpdateBusinessOutput = typeof UpdateBusinessOutput.Type

export const updateBusinessOperation = defineOperation({
  id: "paddle.update-business",
  method: "PATCH",
  path: "/customers/{customer_id}/businesses/{business_id}",
  inputSchema: UpdateBusinessInput,
  outputSchema: UpdateBusinessOutput,
  status: [200],
  contentType: "json",
  pathParams: ["business_id", "customer_id"],
  bodyParams: ["name", "company_number", "tax_identifier", "status", "contacts", "custom_data"]
})

/**
 * Update a business for a customer
 */
export const updateBusiness = (input: UpdateBusinessInput) =>
  PaddleClient.pipe(Effect.flatMap((client) => client.request(updateBusinessOperation, input)))
