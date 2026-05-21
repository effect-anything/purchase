import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const SeatTierType = Schema.Literal("volume", "graduated")
export type SeatTierType = typeof SeatTierType.Type
