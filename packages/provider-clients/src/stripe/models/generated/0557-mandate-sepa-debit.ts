import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const MandateSepaDebit = Schema.Struct({
  reference: Schema.String,
  url: Schema.String
})
export type MandateSepaDebit = typeof MandateSepaDebit.Type
