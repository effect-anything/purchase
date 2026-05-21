import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const CheckoutLinkWalletOptions = Schema.Struct({
  display: Schema.optional(Schema.Literal("auto", "never"))
})
export type CheckoutLinkWalletOptions = typeof CheckoutLinkWalletOptions.Type
