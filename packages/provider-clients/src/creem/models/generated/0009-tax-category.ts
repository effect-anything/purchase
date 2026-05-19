import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const TaxCategory = Schema.Literal("saas", "digital-goods-service", "ebooks")
export type TaxCategory = typeof TaxCategory.Type
