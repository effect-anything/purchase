import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const PaymentLinksResourceCustomFields = Schema.Struct({
  dropdown: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.PaymentLinksResourceCustomFieldsDropdown, any, any> =>
        Models.PaymentLinksResourceCustomFieldsDropdown as Schema.Schema<
          Models.PaymentLinksResourceCustomFieldsDropdown,
          any,
          any
        >
    )
  ),
  key: Schema.String,
  label: Schema.suspend(
    (): Schema.Schema<Models.PaymentLinksResourceCustomFieldsLabel, any, any> =>
      Models.PaymentLinksResourceCustomFieldsLabel as Schema.Schema<
        Models.PaymentLinksResourceCustomFieldsLabel,
        any,
        any
      >
  ),
  numeric: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.PaymentLinksResourceCustomFieldsNumeric, any, any> =>
        Models.PaymentLinksResourceCustomFieldsNumeric as Schema.Schema<
          Models.PaymentLinksResourceCustomFieldsNumeric,
          any,
          any
        >
    )
  ),
  optional: Schema.Boolean,
  text: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.PaymentLinksResourceCustomFieldsText, any, any> =>
        Models.PaymentLinksResourceCustomFieldsText as Schema.Schema<
          Models.PaymentLinksResourceCustomFieldsText,
          any,
          any
        >
    )
  ),
  type: Schema.Literal("dropdown", "numeric", "text")
})
export type PaymentLinksResourceCustomFields = typeof PaymentLinksResourceCustomFields.Type
