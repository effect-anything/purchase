import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const ContactsCreate = Schema.Struct({
  name: Schema.optional(
    Schema.suspend((): Schema.Schema<Models.Name, any, any> => Models.Name as Schema.Schema<Models.Name, any, any>)
  ),
  email: Schema.suspend(
    (): Schema.Schema<Models.Email, any, any> => Models.Email as Schema.Schema<Models.Email, any, any>
  )
})
export type ContactsCreate = typeof ContactsCreate.Type
