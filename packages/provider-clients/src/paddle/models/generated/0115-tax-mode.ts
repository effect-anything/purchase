import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const TaxMode = Schema.Literal("account_setting", "external", "internal", "location")
export type TaxMode = typeof TaxMode.Type
