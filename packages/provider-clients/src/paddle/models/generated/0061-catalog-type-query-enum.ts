import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const CatalogTypeQueryEnum = Schema.Literal("custom", "standard")
export type CatalogTypeQueryEnum = typeof CatalogTypeQueryEnum.Type
