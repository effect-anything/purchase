import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const CheckoutSessionWalletOptions = Schema.Struct({
  link: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.CheckoutLinkWalletOptions, any, any> =>
        Models.CheckoutLinkWalletOptions as Schema.Schema<Models.CheckoutLinkWalletOptions, any, any>
    )
  )
})
export type CheckoutSessionWalletOptions = typeof CheckoutSessionWalletOptions.Type
