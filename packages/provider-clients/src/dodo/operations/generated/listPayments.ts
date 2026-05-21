import * as Effect from "effect/Effect"
import * as Schema from "effect/Schema"

import { defineOperation } from "../../../core/operation.ts"
import { DodoClient } from "../../client.ts"
import * as Models from "../../models.ts"

export const ListPaymentsInput = Schema.Struct({
  page_number: Schema.optional(Schema.Number),
  page_size: Schema.optional(Schema.Number)
})
export type ListPaymentsInput = typeof ListPaymentsInput.Type

export const ListPaymentsOutput = Models.PaymentListResponse
export type ListPaymentsOutput = typeof ListPaymentsOutput.Type

export const listPaymentsOperation = defineOperation({
  id: "dodo.listPayments",
  method: "GET",
  path: "/payments",
  inputSchema: ListPaymentsInput,
  outputSchema: ListPaymentsOutput,
  status: [200],
  contentType: "json",
  queryParams: ["page_number", "page_size"]
})

/**
 * List payments
 */
export const listPayments = (input: ListPaymentsInput) =>
  DodoClient.pipe(Effect.flatMap((client) => client.request(listPaymentsOperation, input)))
