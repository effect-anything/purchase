import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const PaymentLinksResourceCustomFieldsDropdown = Schema.Struct({
  default_value: Schema.NullOr(Schema.String),
  options: Schema.Array(
    Schema.suspend(
      (): Schema.Schema<Models.PaymentLinksResourceCustomFieldsDropdownOption, any, any> =>
        Models.PaymentLinksResourceCustomFieldsDropdownOption as Schema.Schema<
          Models.PaymentLinksResourceCustomFieldsDropdownOption,
          any,
          any
        >
    )
  )
})
export type PaymentLinksResourceCustomFieldsDropdown = typeof PaymentLinksResourceCustomFieldsDropdown.Type
