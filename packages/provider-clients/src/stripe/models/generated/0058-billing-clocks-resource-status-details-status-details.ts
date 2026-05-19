import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const BillingClocksResourceStatusDetailsStatusDetails = Schema.Struct({
  advancing: Schema.optional(Schema.suspend((): typeof Models.BillingClocksResourceStatusDetailsAdvancingStatusDetails => Models.BillingClocksResourceStatusDetailsAdvancingStatusDetails)),
})
export type BillingClocksResourceStatusDetailsStatusDetails = typeof BillingClocksResourceStatusDetailsStatusDetails.Type
