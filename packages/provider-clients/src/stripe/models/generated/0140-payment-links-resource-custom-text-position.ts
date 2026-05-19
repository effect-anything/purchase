import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const PaymentLinksResourceCustomTextPosition = Schema.Struct({
  message: Schema.String,
})
export type PaymentLinksResourceCustomTextPosition = typeof PaymentLinksResourceCustomTextPosition.Type
