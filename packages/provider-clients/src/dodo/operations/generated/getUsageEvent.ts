import * as Effect from "effect/Effect"
import * as Schema from "effect/Schema"

import { defineOperation } from "../../../core/operation.ts"
import * as Models from "../../models.ts"
import { DodoClient } from "../../client.ts"

export const GetUsageEventInput = Schema.Struct({
  event_id: Schema.String,
})
export type GetUsageEventInput = typeof GetUsageEventInput.Type

export const GetUsageEventOutput = Models.UsageEvent
export type GetUsageEventOutput = typeof GetUsageEventOutput.Type

export const getUsageEventOperation = defineOperation({
  id: "dodo.getUsageEvent",
  method: "GET",
  path: "/events/{event_id}",
  inputSchema: GetUsageEventInput,
  outputSchema: GetUsageEventOutput,
  status: [200],
  contentType: "json",
  pathParams: ["event_id"]
})

/**
 * Get usage event
 */
export const getUsageEvent = (input: GetUsageEventInput) =>
  DodoClient.pipe(Effect.flatMap((client) => client.request(getUsageEventOperation, input)))
