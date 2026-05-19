import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const BusinessContactsItem = Schema.Struct({
  name: Schema.suspend(() => Models.Name),
  email: Schema.suspend(() => Models.Email),
})
export type BusinessContactsItem = typeof BusinessContactsItem.Type
