import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const PaymentLinksResourceCompletionBehaviorRedirect = Schema.Struct({
  url: Schema.String
})
export type PaymentLinksResourceCompletionBehaviorRedirect = typeof PaymentLinksResourceCompletionBehaviorRedirect.Type
