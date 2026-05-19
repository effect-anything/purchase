import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const PaymentMethodUsBankAccountStatusDetails = Schema.Struct({
  blocked: Schema.optional(Schema.suspend((): typeof Models.PaymentMethodUsBankAccountBlocked => Models.PaymentMethodUsBankAccountBlocked)),
})
export type PaymentMethodUsBankAccountStatusDetails = typeof PaymentMethodUsBankAccountStatusDetails.Type
