import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const PaymentProcessor = Schema.Literal("stripe")
export type PaymentProcessor = typeof PaymentProcessor.Type
