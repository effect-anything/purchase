import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const BillingClocksResourceStatusDetailsStatusDetails = Schema.Struct({
  advancing: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.BillingClocksResourceStatusDetailsAdvancingStatusDetails, any, any> =>
        Models.BillingClocksResourceStatusDetailsAdvancingStatusDetails as Schema.Schema<
          Models.BillingClocksResourceStatusDetailsAdvancingStatusDetails,
          any,
          any
        >
    )
  )
})
export type BillingClocksResourceStatusDetailsStatusDetails =
  typeof BillingClocksResourceStatusDetailsStatusDetails.Type
