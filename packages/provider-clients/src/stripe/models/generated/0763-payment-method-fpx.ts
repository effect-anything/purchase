import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const PaymentMethodFpx = Schema.Struct({
  account_holder_type: Schema.NullOr(Schema.Literal("company", "individual")),
  bank: Schema.Literal(
    "affin_bank",
    "agrobank",
    "alliance_bank",
    "ambank",
    "bank_islam",
    "bank_muamalat",
    "bank_of_china",
    "bank_rakyat",
    "bsn",
    "cimb",
    "deutsche_bank",
    "hong_leong_bank",
    "hsbc",
    "kfh",
    "maybank2e",
    "maybank2u",
    "ocbc",
    "pb_enterprise",
    "public_bank",
    "rhb",
    "standard_chartered",
    "uob"
  )
})
export type PaymentMethodFpx = typeof PaymentMethodFpx.Type
