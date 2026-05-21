import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const MeterUnit = Schema.Literal("scalar", "token", "custom")
export type MeterUnit = typeof MeterUnit.Type
