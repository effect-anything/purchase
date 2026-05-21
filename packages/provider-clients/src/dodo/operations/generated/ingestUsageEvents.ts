import * as Effect from "effect/Effect"
import * as Schema from "effect/Schema"

import { defineOperation } from "../../../core/operation.ts"
import { DodoClient } from "../../client.ts"
import * as Models from "../../models.ts"

export const IngestUsageEventsInput = Schema.Struct({
  events: Schema.Array(Models.UsageEvent)
})
export type IngestUsageEventsInput = typeof IngestUsageEventsInput.Type

export const IngestUsageEventsOutput = Models.UsageEventIngestResponse
export type IngestUsageEventsOutput = typeof IngestUsageEventsOutput.Type

export const ingestUsageEventsOperation = defineOperation({
  id: "dodo.ingestUsageEvents",
  method: "POST",
  path: "/events/ingest",
  inputSchema: IngestUsageEventsInput,
  outputSchema: IngestUsageEventsOutput,
  status: [200],
  contentType: "json",
  bodyParams: ["events"]
})

/**
 * Ingest usage events
 */
export const ingestUsageEvents = (input: IngestUsageEventsInput) =>
  DodoClient.pipe(Effect.flatMap((client) => client.request(ingestUsageEventsOperation, input)))
