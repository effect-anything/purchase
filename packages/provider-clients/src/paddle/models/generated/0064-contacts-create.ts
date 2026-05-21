import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const ContactsCreate = Schema.Struct({
  name: Schema.optional(Schema.suspend((): Schema.Schema<Models.Name> => Models.Name)),
  email: Schema.suspend((): Schema.Schema<Models.Email> => Models.Email)
})
export type ContactsCreate = typeof ContactsCreate.Type
