import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const PriceRequiresPaymentMethod = Schema.Boolean
export type PriceRequiresPaymentMethod = typeof PriceRequiresPaymentMethod.Type
