import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const ImportMeta = Schema.Struct({
  external_id: Schema.optional(
    Schema.NullOr(Schema.suspend((): Schema.Schema<Models.ExternalId> => Models.ExternalId))
  ),
  imported_from: Schema.String
})
export type ImportMeta = typeof ImportMeta.Type
