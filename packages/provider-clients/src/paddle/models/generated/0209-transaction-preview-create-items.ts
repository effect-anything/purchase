import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const TransactionPreviewCreateItems = Schema.Union(Schema.suspend(() => Models.TransactionPreviewItemWithPriceIdRequest), Schema.suspend(() => Models.TransactionPreviewItemWithPriceRequest), Schema.suspend(() => Models.TransactionPreviewItemWithPriceAndProductRequest))
export type TransactionPreviewCreateItems = typeof TransactionPreviewCreateItems.Type
