import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const PaymentLinksResourcePhoneNumberCollection = Schema.Struct({
  enabled: Schema.Boolean,
})
export type PaymentLinksResourcePhoneNumberCollection = typeof PaymentLinksResourcePhoneNumberCollection.Type
