import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const TaxBehavior = Schema.Literal("inclusive", "exclusive")
export type TaxBehavior = typeof TaxBehavior.Type
