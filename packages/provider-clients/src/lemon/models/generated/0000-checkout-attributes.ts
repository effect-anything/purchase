import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const CheckoutAttributes = Schema.Record({ key: Schema.String, value: Schema.Unknown })
export type CheckoutAttributes = typeof CheckoutAttributes.Type
