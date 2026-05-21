import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const CheckoutBillingAddressFields = Schema.Struct({
  country: Schema.suspend(
    (): Schema.Schema<Models.BillingAddressFieldMode, any, any> =>
      Models.BillingAddressFieldMode as Schema.Schema<Models.BillingAddressFieldMode, any, any>
  ),
  state: Schema.suspend(
    (): Schema.Schema<Models.BillingAddressFieldMode, any, any> =>
      Models.BillingAddressFieldMode as Schema.Schema<Models.BillingAddressFieldMode, any, any>
  ),
  city: Schema.suspend(
    (): Schema.Schema<Models.BillingAddressFieldMode, any, any> =>
      Models.BillingAddressFieldMode as Schema.Schema<Models.BillingAddressFieldMode, any, any>
  ),
  postal_code: Schema.suspend(
    (): Schema.Schema<Models.BillingAddressFieldMode, any, any> =>
      Models.BillingAddressFieldMode as Schema.Schema<Models.BillingAddressFieldMode, any, any>
  ),
  line1: Schema.suspend(
    (): Schema.Schema<Models.BillingAddressFieldMode, any, any> =>
      Models.BillingAddressFieldMode as Schema.Schema<Models.BillingAddressFieldMode, any, any>
  ),
  line2: Schema.suspend(
    (): Schema.Schema<Models.BillingAddressFieldMode, any, any> =>
      Models.BillingAddressFieldMode as Schema.Schema<Models.BillingAddressFieldMode, any, any>
  )
})
export type CheckoutBillingAddressFields = typeof CheckoutBillingAddressFields.Type
