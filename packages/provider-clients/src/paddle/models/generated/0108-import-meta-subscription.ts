import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const ImportMetaSubscription = Schema.Struct({
  external_id: Schema.optional(
    Schema.NullOr(
      Schema.suspend(
        (): Schema.Schema<Models.ExternalId, any, any> =>
          Models.ExternalId as Schema.Schema<Models.ExternalId, any, any>
      )
    )
  ),
  imported_from: Schema.String
})
export type ImportMetaSubscription = typeof ImportMetaSubscription.Type
