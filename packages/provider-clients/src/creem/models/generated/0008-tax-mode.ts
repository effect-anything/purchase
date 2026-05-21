import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const TaxMode = Schema.Literal("inclusive", "exclusive")
export type TaxMode = typeof TaxMode.Type
