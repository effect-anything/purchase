import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const AlmaInstallments = Schema.Struct({
  count: Schema.Number
})
export type AlmaInstallments = typeof AlmaInstallments.Type
