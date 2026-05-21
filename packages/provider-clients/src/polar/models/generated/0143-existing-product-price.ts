import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const ExistingProductPrice = Schema.Struct({
  id: Schema.String
})
export type ExistingProductPrice = typeof ExistingProductPrice.Type
