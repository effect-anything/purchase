import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const PaymentLinksResourceInvoiceSettings = Schema.Struct({
  account_tax_ids: Schema.NullOr(
    Schema.Array(
      Schema.Union(
        Schema.String,
        Schema.suspend(
          (): Schema.Schema<Models.TaxId, any, any> => Models.TaxId as Schema.Schema<Models.TaxId, any, any>
        ),
        Schema.suspend(
          (): Schema.Schema<Models.DeletedTaxId, any, any> =>
            Models.DeletedTaxId as Schema.Schema<Models.DeletedTaxId, any, any>
        )
      )
    )
  ),
  custom_fields: Schema.NullOr(
    Schema.Array(
      Schema.suspend(
        (): Schema.Schema<Models.InvoiceSettingCustomField, any, any> =>
          Models.InvoiceSettingCustomField as Schema.Schema<Models.InvoiceSettingCustomField, any, any>
      )
    )
  ),
  description: Schema.NullOr(Schema.String),
  footer: Schema.NullOr(Schema.String),
  issuer: Schema.NullOr(
    Schema.suspend(
      (): Schema.Schema<Models.ConnectAccountReference, any, any> =>
        Models.ConnectAccountReference as Schema.Schema<Models.ConnectAccountReference, any, any>
    )
  ),
  metadata: Schema.NullOr(Schema.Record({ key: Schema.String, value: Schema.String })),
  rendering_options: Schema.NullOr(
    Schema.suspend(
      (): Schema.Schema<Models.InvoiceSettingCheckoutRenderingOptions, any, any> =>
        Models.InvoiceSettingCheckoutRenderingOptions as Schema.Schema<
          Models.InvoiceSettingCheckoutRenderingOptions,
          any,
          any
        >
    )
  )
})
export type PaymentLinksResourceInvoiceSettings = typeof PaymentLinksResourceInvoiceSettings.Type
