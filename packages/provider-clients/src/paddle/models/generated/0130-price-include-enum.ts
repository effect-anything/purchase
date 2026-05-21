import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const PriceIncludeEnum = Schema.Literal("product")
export type PriceIncludeEnum = typeof PriceIncludeEnum.Type
