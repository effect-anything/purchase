import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const ProductIncludeEnum = Schema.Literal("prices")
export type ProductIncludeEnum = typeof ProductIncludeEnum.Type
