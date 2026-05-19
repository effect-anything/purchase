import * as Effect from "effect/Effect"
import * as Schema from "effect/Schema"

import { defineOperation } from "../../../core/operation.ts"
import * as Models from "../../models.ts"
import { DodoClient } from "../../client.ts"

export const CreateMeterInput = Schema.Struct({
  aggregation: Models.MeterAggregation,
  event_name: Schema.String,
  measurement_unit: Schema.String,
  description: Schema.optional(Schema.NullOr(Schema.String)),
  filter: Schema.optional(Models.MeterFilter),
})
export type CreateMeterInput = typeof CreateMeterInput.Type

export const CreateMeterOutput = Models.Meter
export type CreateMeterOutput = typeof CreateMeterOutput.Type

export const createMeterOperation = defineOperation({
  id: "dodo.createMeter",
  method: "POST",
  path: "/meters",
  inputSchema: CreateMeterInput,
  outputSchema: CreateMeterOutput,
  status: [200],
  contentType: "json",
  bodyParams: ["aggregation", "event_name", "measurement_unit", "name", "description", "filter"]
})

/**
 * Create meter
 */
export const createMeter = (input: CreateMeterInput) =>
  DodoClient.pipe(Effect.flatMap((client) => client.request(createMeterOperation, input)))
