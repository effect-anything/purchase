import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const BusinessContactsItem = Schema.Struct({
  name: Schema.suspend((): Schema.Schema<Models.Name> => Models.Name),
  email: Schema.suspend((): Schema.Schema<Models.Email> => Models.Email)
})
export type BusinessContactsItem = typeof BusinessContactsItem.Type
