import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const Duration = Schema.Struct({
  interval: Schema.suspend((): Schema.Schema<Models.DurationInterval> => Models.DurationInterval),
  frequency: Schema.Number
})
export type Duration = typeof Duration.Type
