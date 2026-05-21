import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const PaymentMethodUsBankAccountStatusDetails = Schema.Struct({
  blocked: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.PaymentMethodUsBankAccountBlocked, any, any> =>
        Models.PaymentMethodUsBankAccountBlocked as Schema.Schema<Models.PaymentMethodUsBankAccountBlocked, any, any>
    )
  )
})
export type PaymentMethodUsBankAccountStatusDetails = typeof PaymentMethodUsBankAccountStatusDetails.Type
