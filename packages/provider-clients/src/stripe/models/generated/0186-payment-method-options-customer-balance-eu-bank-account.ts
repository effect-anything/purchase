import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const PaymentMethodOptionsCustomerBalanceEuBankAccount = Schema.Struct({
  country: Schema.Literal("BE", "DE", "ES", "FR", "IE", "NL"),
})
export type PaymentMethodOptionsCustomerBalanceEuBankAccount = typeof PaymentMethodOptionsCustomerBalanceEuBankAccount.Type
