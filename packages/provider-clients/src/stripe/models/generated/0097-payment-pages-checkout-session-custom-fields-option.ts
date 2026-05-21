import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const PaymentPagesCheckoutSessionCustomFieldsOption = Schema.Struct({
  label: Schema.String,
  value: Schema.String
})
export type PaymentPagesCheckoutSessionCustomFieldsOption = typeof PaymentPagesCheckoutSessionCustomFieldsOption.Type
