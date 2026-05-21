import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const DeletedExternalAccount = Schema.Union(
  Schema.suspend(
    (): Schema.Schema<Models.DeletedBankAccount, any, any> =>
      Models.DeletedBankAccount as Schema.Schema<Models.DeletedBankAccount, any, any>
  ),
  Schema.suspend(
    (): Schema.Schema<Models.DeletedCard, any, any> => Models.DeletedCard as Schema.Schema<Models.DeletedCard, any, any>
  )
)
export type DeletedExternalAccount = typeof DeletedExternalAccount.Type
