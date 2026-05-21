import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const PaymentLinksResourceRestrictions = Schema.Struct({
  completed_sessions: Schema.suspend(
    (): Schema.Schema<Models.PaymentLinksResourceCompletedSessions, any, any> =>
      Models.PaymentLinksResourceCompletedSessions as Schema.Schema<
        Models.PaymentLinksResourceCompletedSessions,
        any,
        any
      >
  )
})
export type PaymentLinksResourceRestrictions = typeof PaymentLinksResourceRestrictions.Type
