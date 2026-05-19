import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const CustomerLinksEntity = Schema.Struct({
  customer_portal_link: Schema.String,
})
export type CustomerLinksEntity = typeof CustomerLinksEntity.Type
