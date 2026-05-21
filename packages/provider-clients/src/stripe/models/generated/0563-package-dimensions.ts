import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const PackageDimensions = Schema.Struct({
  height: Schema.Number,
  length: Schema.Number,
  weight: Schema.Number,
  width: Schema.Number
})
export type PackageDimensions = typeof PackageDimensions.Type
