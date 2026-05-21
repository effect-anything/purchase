import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const PaymentsPrimitivesPaymentRecordsResourcePaymentMethodMobilepayDetailsResourceCard = Schema.Struct({
  brand: Schema.NullOr(Schema.String),
  country: Schema.NullOr(Schema.String),
  exp_month: Schema.NullOr(Schema.Number),
  exp_year: Schema.NullOr(Schema.Number),
  last4: Schema.NullOr(Schema.String)
})
export type PaymentsPrimitivesPaymentRecordsResourcePaymentMethodMobilepayDetailsResourceCard =
  typeof PaymentsPrimitivesPaymentRecordsResourcePaymentMethodMobilepayDetailsResourceCard.Type
