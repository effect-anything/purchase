import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const CheckoutCardInstallmentsOptions = Schema.Struct({
  enabled: Schema.optional(Schema.Boolean),
})
export type CheckoutCardInstallmentsOptions = typeof CheckoutCardInstallmentsOptions.Type
