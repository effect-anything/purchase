import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const MandateUsBankAccount = Schema.Struct({
  collection_method: Schema.optional(Schema.Literal("paper"))
})
export type MandateUsBankAccount = typeof MandateUsBankAccount.Type
