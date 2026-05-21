import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const BillingAddressFieldMode = Schema.Literal("required", "optional", "disabled")
export type BillingAddressFieldMode = typeof BillingAddressFieldMode.Type
