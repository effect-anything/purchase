import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const AccountDeclineChargeOn = Schema.Struct({
  avs_failure: Schema.Boolean,
  cvc_failure: Schema.Boolean,
})
export type AccountDeclineChargeOn = typeof AccountDeclineChargeOn.Type
