import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export type InvoiceSettingSubscriptionScheduleSetting = {
  readonly account_tax_ids: ReadonlyArray<string | Models.TaxId | Models.DeletedTaxId> | null
  readonly days_until_due: number | null
  readonly issuer: Models.ConnectAccountReference
}

export const InvoiceSettingSubscriptionScheduleSetting = Schema.Struct({
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
  days_until_due: Schema.NullOr(Schema.Number),
  issuer: Schema.suspend(
    (): Schema.Schema<Models.ConnectAccountReference, any, any> =>
      Models.ConnectAccountReference as Schema.Schema<Models.ConnectAccountReference, any, any>
  )
})
