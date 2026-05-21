import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export type InvoiceSettingCustomerSetting = {
  readonly custom_fields: ReadonlyArray<Models.InvoiceSettingCustomField> | null
  readonly default_payment_method: string | Models.PaymentMethod | null
  readonly footer: string | null
  readonly rendering_options: Models.InvoiceSettingCustomerRenderingOptions | null
}

export const InvoiceSettingCustomerSetting = Schema.Struct({
  custom_fields: Schema.NullOr(
    Schema.Array(
      Schema.suspend(
        (): Schema.Schema<Models.InvoiceSettingCustomField, any, any> =>
          Models.InvoiceSettingCustomField as Schema.Schema<Models.InvoiceSettingCustomField, any, any>
      )
    )
  ),
  default_payment_method: Schema.NullOr(
    Schema.Union(
      Schema.String,
      Schema.suspend(
        (): Schema.Schema<Models.PaymentMethod, any, any> =>
          Models.PaymentMethod as Schema.Schema<Models.PaymentMethod, any, any>
      )
    )
  ),
  footer: Schema.NullOr(Schema.String),
  rendering_options: Schema.NullOr(
    Schema.suspend(
      (): Schema.Schema<Models.InvoiceSettingCustomerRenderingOptions, any, any> =>
        Models.InvoiceSettingCustomerRenderingOptions as Schema.Schema<
          Models.InvoiceSettingCustomerRenderingOptions,
          any,
          any
        >
    )
  )
})
