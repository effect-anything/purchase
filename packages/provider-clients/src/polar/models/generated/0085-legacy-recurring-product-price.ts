import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const LegacyRecurringProductPrice = Schema.Union(Schema.suspend((): typeof Models.LegacyRecurringProductPriceFixed => Models.LegacyRecurringProductPriceFixed), Schema.suspend((): typeof Models.LegacyRecurringProductPriceCustom => Models.LegacyRecurringProductPriceCustom), Schema.suspend((): typeof Models.LegacyRecurringProductPriceFree => Models.LegacyRecurringProductPriceFree))
export type LegacyRecurringProductPrice = typeof LegacyRecurringProductPrice.Type
