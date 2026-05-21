import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const MeterAggregationType = Schema.Literal("count", "sum", "max", "last")
export type MeterAggregationType = typeof MeterAggregationType.Type
