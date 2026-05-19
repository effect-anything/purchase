import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const PaymentLinksResourceRestrictions = Schema.Struct({
  completed_sessions: Schema.suspend((): typeof Models.PaymentLinksResourceCompletedSessions => Models.PaymentLinksResourceCompletedSessions),
})
export type PaymentLinksResourceRestrictions = typeof PaymentLinksResourceRestrictions.Type
