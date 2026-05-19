import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const PaymentLinksResourceAfterCompletion = Schema.Struct({
  hosted_confirmation: Schema.optional(Schema.suspend((): typeof Models.PaymentLinksResourceCompletionBehaviorConfirmationPage => Models.PaymentLinksResourceCompletionBehaviorConfirmationPage)),
  redirect: Schema.optional(Schema.suspend((): typeof Models.PaymentLinksResourceCompletionBehaviorRedirect => Models.PaymentLinksResourceCompletionBehaviorRedirect)),
  type: Schema.Literal("hosted_confirmation", "redirect"),
})
export type PaymentLinksResourceAfterCompletion = typeof PaymentLinksResourceAfterCompletion.Type
