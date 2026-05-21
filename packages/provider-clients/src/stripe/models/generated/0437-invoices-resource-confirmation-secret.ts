import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const InvoicesResourceConfirmationSecret = Schema.Struct({
  client_secret: Schema.String,
  type: Schema.String
})
export type InvoicesResourceConfirmationSecret = typeof InvoicesResourceConfirmationSecret.Type
