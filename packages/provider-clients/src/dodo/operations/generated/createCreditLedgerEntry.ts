import * as Effect from "effect/Effect"
import * as Schema from "effect/Schema"

import { defineOperation } from "../../../core/operation.ts"
import * as Models from "../../models.ts"
import { DodoClient } from "../../client.ts"

export const CreateCreditLedgerEntryInput = Schema.Struct({
  credit_entitlement_id: Schema.String,
  customer_id: Schema.String,
  amount: Schema.String,
  entry_type: Models.LedgerEntryType,
  expires_at: Schema.optional(Schema.NullOr(Schema.String)),
  idempotency_key: Schema.optional(Schema.NullOr(Schema.String)),
  metadata: Schema.optional(Models.Metadata),
  reason: Schema.optional(Schema.NullOr(Schema.String)),
})
export type CreateCreditLedgerEntryInput = typeof CreateCreditLedgerEntryInput.Type

export const CreateCreditLedgerEntryOutput = Models.CreditLedgerEntryCreateResponse
export type CreateCreditLedgerEntryOutput = typeof CreateCreditLedgerEntryOutput.Type

export const createCreditLedgerEntryOperation = defineOperation({
  id: "dodo.createCreditLedgerEntry",
  method: "POST",
  path: "/credit-entitlements/{credit_entitlement_id}/balances/{customer_id}/ledger-entries",
  inputSchema: CreateCreditLedgerEntryInput,
  outputSchema: CreateCreditLedgerEntryOutput,
  status: [201],
  contentType: "json",
  pathParams: ["credit_entitlement_id", "customer_id"],
  bodyParams: ["amount", "entry_type", "expires_at", "idempotency_key", "metadata", "reason"]
})

/**
 * Create credit ledger entry
 */
export const createCreditLedgerEntry = (input: CreateCreditLedgerEntryInput) =>
  DodoClient.pipe(Effect.flatMap((client) => client.request(createCreditLedgerEntryOperation, input)))
