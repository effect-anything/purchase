import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const Conjunction = Schema.Literal("and", "or")
export type Conjunction = typeof Conjunction.Type
