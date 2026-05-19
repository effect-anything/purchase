import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const PaymentIntentNextActionKonbiniStores = Schema.Struct({
  familymart: Schema.NullOr(Schema.suspend((): typeof Models.PaymentIntentNextActionKonbiniFamilymart => Models.PaymentIntentNextActionKonbiniFamilymart)),
  lawson: Schema.NullOr(Schema.suspend((): typeof Models.PaymentIntentNextActionKonbiniLawson => Models.PaymentIntentNextActionKonbiniLawson)),
  ministop: Schema.NullOr(Schema.suspend((): typeof Models.PaymentIntentNextActionKonbiniMinistop => Models.PaymentIntentNextActionKonbiniMinistop)),
  seicomart: Schema.NullOr(Schema.suspend((): typeof Models.PaymentIntentNextActionKonbiniSeicomart => Models.PaymentIntentNextActionKonbiniSeicomart)),
})
export type PaymentIntentNextActionKonbiniStores = typeof PaymentIntentNextActionKonbiniStores.Type
