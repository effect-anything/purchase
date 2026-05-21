import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const PaymentMethodOptionsUsBankAccountMandateOptions = Schema.Struct({
  collection_method: Schema.optional(Schema.Literal("paper"))
})
export type PaymentMethodOptionsUsBankAccountMandateOptions =
  typeof PaymentMethodOptionsUsBankAccountMandateOptions.Type
