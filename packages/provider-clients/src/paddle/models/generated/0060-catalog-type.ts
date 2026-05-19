import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const CatalogType = Schema.Literal("custom", "standard")
export type CatalogType = typeof CatalogType.Type
