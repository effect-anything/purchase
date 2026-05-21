import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const KlarnaPayerDetails = Schema.Struct({
  address: Schema.NullOr(
    Schema.suspend(
      (): Schema.Schema<Models.KlarnaAddress, any, any> =>
        Models.KlarnaAddress as Schema.Schema<Models.KlarnaAddress, any, any>
    )
  )
})
export type KlarnaPayerDetails = typeof KlarnaPayerDetails.Type
