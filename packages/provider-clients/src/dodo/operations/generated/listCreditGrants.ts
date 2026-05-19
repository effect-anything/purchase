import * as Effect from "effect/Effect"
import * as Schema from "effect/Schema"

import { defineOperation } from "../../../core/operation.ts"
import * as Models from "../../models.ts"
import { DodoClient } from "../../client.ts"

export const ListCreditGrantsInput = Schema.Struct({
  credit_entitlement_id: Schema.String,
  customer_id: Schema.String,
  page_number: Schema.optional(Schema.Number),
  page_size: Schema.optional(Schema.Number),
  status: Schema.optional(Schema.Literal("active", "expired", "depleted")),
})
export type ListCreditGrantsInput = typeof ListCreditGrantsInput.Type

export const ListCreditGrantsOutput = Models.CreditGrantListResponse
export type ListCreditGrantsOutput = typeof ListCreditGrantsOutput.Type

export const listCreditGrantsOperation = defineOperation({
  id: "dodo.listCreditGrants",
  method: "GET",
  path: "/credit-entitlements/{credit_entitlement_id}/balances/{customer_id}/grants",
  inputSchema: ListCreditGrantsInput,
  outputSchema: ListCreditGrantsOutput,
  status: [200],
  contentType: "json",
  pathParams: ["credit_entitlement_id", "customer_id"],
  queryParams: ["page_number", "page_size", "status"]
})

/**
 * List credit grants
 */
export const listCreditGrants = (input: ListCreditGrantsInput) =>
  DodoClient.pipe(Effect.flatMap((client) => client.request(listCreditGrantsOperation, input)))
