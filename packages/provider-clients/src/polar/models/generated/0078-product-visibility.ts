import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const ProductVisibility = Schema.Literal("draft", "private", "public")
export type ProductVisibility = typeof ProductVisibility.Type
