import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const UnderlyingDetails = Schema.Struct({
  korea_local: Schema.NullOr(
    Schema.suspend(
      (): Schema.Schema<Models.KoreaLocalUnderlyingDetails, any, any> =>
        Models.KoreaLocalUnderlyingDetails as Schema.Schema<Models.KoreaLocalUnderlyingDetails, any, any>
    )
  )
})
export type UnderlyingDetails = typeof UnderlyingDetails.Type
