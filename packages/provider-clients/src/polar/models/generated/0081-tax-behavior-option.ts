import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const TaxBehaviorOption = Schema.Literal("location", "inclusive", "exclusive")
export type TaxBehaviorOption = typeof TaxBehaviorOption.Type
