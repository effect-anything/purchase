import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const PaymentLinksResourceAfterCompletion = Schema.Struct({
  hosted_confirmation: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.PaymentLinksResourceCompletionBehaviorConfirmationPage, any, any> =>
        Models.PaymentLinksResourceCompletionBehaviorConfirmationPage as Schema.Schema<
          Models.PaymentLinksResourceCompletionBehaviorConfirmationPage,
          any,
          any
        >
    )
  ),
  redirect: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.PaymentLinksResourceCompletionBehaviorRedirect, any, any> =>
        Models.PaymentLinksResourceCompletionBehaviorRedirect as Schema.Schema<
          Models.PaymentLinksResourceCompletionBehaviorRedirect,
          any,
          any
        >
    )
  ),
  type: Schema.Literal("hosted_confirmation", "redirect")
})
export type PaymentLinksResourceAfterCompletion = typeof PaymentLinksResourceAfterCompletion.Type
