import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const CheckoutBillingAddressFields = Schema.Struct({
  country: Schema.suspend((): typeof Models.BillingAddressFieldMode => Models.BillingAddressFieldMode),
  state: Schema.suspend((): typeof Models.BillingAddressFieldMode => Models.BillingAddressFieldMode),
  city: Schema.suspend((): typeof Models.BillingAddressFieldMode => Models.BillingAddressFieldMode),
  postal_code: Schema.suspend((): typeof Models.BillingAddressFieldMode => Models.BillingAddressFieldMode),
  line1: Schema.suspend((): typeof Models.BillingAddressFieldMode => Models.BillingAddressFieldMode),
  line2: Schema.suspend((): typeof Models.BillingAddressFieldMode => Models.BillingAddressFieldMode),
})
export type CheckoutBillingAddressFields = typeof CheckoutBillingAddressFields.Type
