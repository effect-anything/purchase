import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const CheckoutSessionWalletOptions = Schema.Struct({
  link: Schema.optional(Schema.suspend((): typeof Models.CheckoutLinkWalletOptions => Models.CheckoutLinkWalletOptions)),
})
export type CheckoutSessionWalletOptions = typeof CheckoutSessionWalletOptions.Type
