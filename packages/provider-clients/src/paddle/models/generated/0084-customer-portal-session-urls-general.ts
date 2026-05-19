import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const CustomerPortalSessionUrlsGeneral = Schema.Struct({
  overview: Schema.String,
})
export type CustomerPortalSessionUrlsGeneral = typeof CustomerPortalSessionUrlsGeneral.Type
