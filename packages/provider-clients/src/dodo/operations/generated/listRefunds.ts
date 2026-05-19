import * as Effect from "effect/Effect"
import * as Schema from "effect/Schema"

import { defineOperation } from "../../../core/operation.ts"
import * as Models from "../../models.ts"
import { DodoClient } from "../../client.ts"

export const ListRefundsInput = Schema.Struct({
  page_number: Schema.optional(Schema.Number),
  page_size: Schema.optional(Schema.Number),
  created_at_gte: Schema.optional(Schema.String),
  created_at_lte: Schema.optional(Schema.String),
  customer_id: Schema.optional(Schema.String),
  subscription_id: Schema.optional(Schema.String),
  status: Schema.optional(Models.RefundStatus),
})
export type ListRefundsInput = typeof ListRefundsInput.Type

export const ListRefundsOutput = Models.RefundListResponse
export type ListRefundsOutput = typeof ListRefundsOutput.Type

export const listRefundsOperation = defineOperation({
  id: "dodo.listRefunds",
  method: "GET",
  path: "/refunds",
  inputSchema: ListRefundsInput,
  outputSchema: ListRefundsOutput,
  status: [200],
  contentType: "json",
  queryParams: ["page_number", "page_size", "created_at_gte", "created_at_lte", "customer_id", "subscription_id", "status"]
})

/**
 * List refunds
 */
export const listRefunds = (input: ListRefundsInput) =>
  DodoClient.pipe(Effect.flatMap((client) => client.request(listRefundsOperation, input)))
