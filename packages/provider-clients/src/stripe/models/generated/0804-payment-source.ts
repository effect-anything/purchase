import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const PaymentSource = Schema.Union(Schema.suspend((): typeof Models.Account => Models.Account), Schema.suspend((): typeof Models.BankAccount => Models.BankAccount), Schema.suspend((): typeof Models.Card => Models.Card), Schema.suspend((): typeof Models.Source => Models.Source))
export type PaymentSource = typeof PaymentSource.Type
