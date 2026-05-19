import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const TaxCategory = Schema.Literal("digital-goods", "ebooks", "implementation-services", "professional-services", "saas", "software-programming-services", "standard", "training-services", "website-hosting")
export type TaxCategory = typeof TaxCategory.Type
