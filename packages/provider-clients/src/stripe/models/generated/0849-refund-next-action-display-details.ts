import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const RefundNextActionDisplayDetails = Schema.Struct({
  email_sent: Schema.suspend(
    (): Schema.Schema<Models.EmailSent, any, any> => Models.EmailSent as Schema.Schema<Models.EmailSent, any, any>
  ),
  expires_at: Schema.Number
})
export type RefundNextActionDisplayDetails = typeof RefundNextActionDisplayDetails.Type
