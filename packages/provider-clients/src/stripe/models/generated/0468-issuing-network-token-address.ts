import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const IssuingNetworkTokenAddress = Schema.Struct({
  line1: Schema.String,
  postal_code: Schema.String
})
export type IssuingNetworkTokenAddress = typeof IssuingNetworkTokenAddress.Type
