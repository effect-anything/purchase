import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const FilterConjunction = Schema.Literal("and", "or")
export type FilterConjunction = typeof FilterConjunction.Type
