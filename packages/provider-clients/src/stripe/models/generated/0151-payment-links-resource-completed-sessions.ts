import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const PaymentLinksResourceCompletedSessions = Schema.Struct({
  count: Schema.Number,
  limit: Schema.Number,
})
export type PaymentLinksResourceCompletedSessions = typeof PaymentLinksResourceCompletedSessions.Type
