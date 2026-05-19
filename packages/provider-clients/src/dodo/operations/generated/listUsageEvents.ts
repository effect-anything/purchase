import * as Effect from "effect/Effect"
import * as Schema from "effect/Schema"

import { defineOperation } from "../../../core/operation.ts"
import * as Models from "../../models.ts"
import { DodoClient } from "../../client.ts"

export const ListUsageEventsInput = Schema.Struct({
  page_number: Schema.optional(Schema.Number),
  page_size: Schema.optional(Schema.Number),
  customer_id: Schema.optional(Schema.String),
  event_name: Schema.optional(Schema.String),
  meter_id: Schema.optional(Schema.String),
  start: Schema.optional(Schema.String),
  end: Schema.optional(Schema.String),
})
export type ListUsageEventsInput = typeof ListUsageEventsInput.Type

export const ListUsageEventsOutput = Models.UsageEventListResponse
export type ListUsageEventsOutput = typeof ListUsageEventsOutput.Type

export const listUsageEventsOperation = defineOperation({
  id: "dodo.listUsageEvents",
  method: "GET",
  path: "/events",
  inputSchema: ListUsageEventsInput,
  outputSchema: ListUsageEventsOutput,
  status: [200],
  contentType: "json",
  queryParams: ["page_number", "page_size", "customer_id", "event_name", "meter_id", "start", "end"]
})

/**
 * List usage events
 */
export const listUsageEvents = (input: ListUsageEventsInput) =>
  DodoClient.pipe(Effect.flatMap((client) => client.request(listUsageEventsOperation, input)))
