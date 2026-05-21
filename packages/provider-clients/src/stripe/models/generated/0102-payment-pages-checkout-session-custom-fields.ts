import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const PaymentPagesCheckoutSessionCustomFields = Schema.Struct({
  dropdown: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.PaymentPagesCheckoutSessionCustomFieldsDropdown, any, any> =>
        Models.PaymentPagesCheckoutSessionCustomFieldsDropdown as Schema.Schema<
          Models.PaymentPagesCheckoutSessionCustomFieldsDropdown,
          any,
          any
        >
    )
  ),
  key: Schema.String,
  label: Schema.suspend(
    (): Schema.Schema<Models.PaymentPagesCheckoutSessionCustomFieldsLabel, any, any> =>
      Models.PaymentPagesCheckoutSessionCustomFieldsLabel as Schema.Schema<
        Models.PaymentPagesCheckoutSessionCustomFieldsLabel,
        any,
        any
      >
  ),
  numeric: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.PaymentPagesCheckoutSessionCustomFieldsNumeric, any, any> =>
        Models.PaymentPagesCheckoutSessionCustomFieldsNumeric as Schema.Schema<
          Models.PaymentPagesCheckoutSessionCustomFieldsNumeric,
          any,
          any
        >
    )
  ),
  optional: Schema.Boolean,
  text: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.PaymentPagesCheckoutSessionCustomFieldsText, any, any> =>
        Models.PaymentPagesCheckoutSessionCustomFieldsText as Schema.Schema<
          Models.PaymentPagesCheckoutSessionCustomFieldsText,
          any,
          any
        >
    )
  ),
  type: Schema.Literal("dropdown", "numeric", "text")
})
export type PaymentPagesCheckoutSessionCustomFields = typeof PaymentPagesCheckoutSessionCustomFields.Type
