import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const AccountInvoicesSettings = Schema.Struct({
  default_account_tax_ids: Schema.NullOr(
    Schema.Array(
      Schema.Union(
        Schema.String,
        Schema.suspend(
          (): Schema.Schema<Models.TaxId, any, any> => Models.TaxId as Schema.Schema<Models.TaxId, any, any>
        )
      )
    )
  ),
  hosted_payment_method_save: Schema.NullOr(Schema.Literal("always", "never", "offer"))
})
export type AccountInvoicesSettings = typeof AccountInvoicesSettings.Type
