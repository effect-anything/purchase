import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const MandateAuBecsDebit = Schema.Struct({
  url: Schema.String,
})
export type MandateAuBecsDebit = typeof MandateAuBecsDebit.Type
