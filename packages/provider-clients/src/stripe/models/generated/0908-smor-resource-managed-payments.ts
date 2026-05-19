import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const SmorResourceManagedPayments = Schema.Struct({
  enabled: Schema.Boolean,
})
export type SmorResourceManagedPayments = typeof SmorResourceManagedPayments.Type
