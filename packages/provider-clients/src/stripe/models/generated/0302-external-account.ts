import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export type ExternalAccount = Models.BankAccount | Models.Card

export const ExternalAccount = Schema.Union(
  Schema.suspend(
    (): Schema.Schema<Models.BankAccount, any, any> => Models.BankAccount as Schema.Schema<Models.BankAccount, any, any>
  ),
  Schema.suspend((): Schema.Schema<Models.Card, any, any> => Models.Card as Schema.Schema<Models.Card, any, any>)
)
