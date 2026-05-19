import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const PaymentLinksResourceCompletionBehaviorConfirmationPage = Schema.Struct({
  custom_message: Schema.NullOr(Schema.String),
})
export type PaymentLinksResourceCompletionBehaviorConfirmationPage = typeof PaymentLinksResourceCompletionBehaviorConfirmationPage.Type
