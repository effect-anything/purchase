import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const ContactsCreate = Schema.Struct({
  name: Schema.optional(Schema.suspend(() => Models.Name)),
  email: Schema.suspend(() => Models.Email),
})
export type ContactsCreate = typeof ContactsCreate.Type
