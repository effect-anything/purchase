import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const KoreaLocalUnderlyingDetails = Schema.Struct({
  type: Schema.suspend(() => Models.KoreaLocalUnderlyingPaymentMethodType),
})
export type KoreaLocalUnderlyingDetails = typeof KoreaLocalUnderlyingDetails.Type
