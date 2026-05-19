import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const PaymentPagesCheckoutSessionCustomFieldsLabel = Schema.Struct({
  custom: Schema.NullOr(Schema.String),
  type: Schema.Literal("custom"),
})
export type PaymentPagesCheckoutSessionCustomFieldsLabel = typeof PaymentPagesCheckoutSessionCustomFieldsLabel.Type
