import * as Effect from "effect/Effect"
import * as Schema from "effect/Schema"

import { defineOperation } from "../../../core/operation.ts"
import { DodoClient } from "../../client.ts"
import * as Models from "../../models.ts"

export const ListCreditEntitlementsInput = Schema.Struct({
  page_number: Schema.optional(Schema.Number),
  page_size: Schema.optional(Schema.Number),
  deleted: Schema.optional(Schema.Boolean)
})
export type ListCreditEntitlementsInput = typeof ListCreditEntitlementsInput.Type

export const ListCreditEntitlementsOutput = Models.CreditEntitlementListResponse
export type ListCreditEntitlementsOutput = typeof ListCreditEntitlementsOutput.Type

export const listCreditEntitlementsOperation = defineOperation({
  id: "dodo.listCreditEntitlements",
  method: "GET",
  path: "/credit-entitlements",
  inputSchema: ListCreditEntitlementsInput,
  outputSchema: ListCreditEntitlementsOutput,
  status: [200],
  contentType: "json",
  queryParams: ["page_number", "page_size", "deleted"]
})

/**
 * List credit entitlements
 */
export const listCreditEntitlements = (input: ListCreditEntitlementsInput) =>
  DodoClient.pipe(Effect.flatMap((client) => client.request(listCreditEntitlementsOperation, input)))
