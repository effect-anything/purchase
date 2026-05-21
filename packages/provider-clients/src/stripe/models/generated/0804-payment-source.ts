import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export type PaymentSource = Models.Account | Models.BankAccount | Models.Card | Models.Source

export const PaymentSource = Schema.Union(
  Schema.suspend(
    (): Schema.Schema<Models.Account, any, any> => Models.Account as Schema.Schema<Models.Account, any, any>
  ),
  Schema.suspend(
    (): Schema.Schema<Models.BankAccount, any, any> => Models.BankAccount as Schema.Schema<Models.BankAccount, any, any>
  ),
  Schema.suspend((): Schema.Schema<Models.Card, any, any> => Models.Card as Schema.Schema<Models.Card, any, any>),
  Schema.suspend((): Schema.Schema<Models.Source, any, any> => Models.Source as Schema.Schema<Models.Source, any, any>)
)
