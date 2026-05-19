import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const EmailSent = Schema.Struct({
  email_sent_at: Schema.Number,
  email_sent_to: Schema.String,
})
export type EmailSent = typeof EmailSent.Type
