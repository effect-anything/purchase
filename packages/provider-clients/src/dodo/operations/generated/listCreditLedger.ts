import * as Effect from "effect/Effect"
import * as Schema from "effect/Schema"

import { defineOperation } from "../../../core/operation.ts"
import { DodoClient } from "../../client.ts"
import * as Models from "../../models.ts"

export const ListCreditLedgerInput = Schema.Struct({
  credit_entitlement_id: Schema.String,
  customer_id: Schema.String,
  page_number: Schema.optional(Schema.Number),
  page_size: Schema.optional(Schema.Number),
  transaction_type: Schema.optional(Schema.String),
  start_date: Schema.optional(Schema.String),
  end_date: Schema.optional(Schema.String)
})
export type ListCreditLedgerInput = typeof ListCreditLedgerInput.Type

export const ListCreditLedgerOutput = Models.CreditLedgerEntryListResponse
export type ListCreditLedgerOutput = typeof ListCreditLedgerOutput.Type

export const listCreditLedgerOperation = defineOperation({
  id: "dodo.listCreditLedger",
  method: "GET",
  path: "/credit-entitlements/{credit_entitlement_id}/balances/{customer_id}/ledger",
  inputSchema: ListCreditLedgerInput,
  outputSchema: ListCreditLedgerOutput,
  status: [200],
  contentType: "json",
  pathParams: ["credit_entitlement_id", "customer_id"],
  queryParams: ["page_number", "page_size", "transaction_type", "start_date", "end_date"]
})

/**
 * List credit ledger
 */
export const listCreditLedger = (input: ListCreditLedgerInput) =>
  DodoClient.pipe(Effect.flatMap((client) => client.request(listCreditLedgerOperation, input)))
