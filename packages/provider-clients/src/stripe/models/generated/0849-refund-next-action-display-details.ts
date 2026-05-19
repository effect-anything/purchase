import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const RefundNextActionDisplayDetails = Schema.Struct({
  email_sent: Schema.suspend((): typeof Models.EmailSent => Models.EmailSent),
  expires_at: Schema.Number,
})
export type RefundNextActionDisplayDetails = typeof RefundNextActionDisplayDetails.Type
