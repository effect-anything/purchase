import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const ExternalAccount = Schema.Union(Schema.suspend((): typeof Models.BankAccount => Models.BankAccount), Schema.suspend((): typeof Models.Card => Models.Card))
export type ExternalAccount = typeof ExternalAccount.Type
