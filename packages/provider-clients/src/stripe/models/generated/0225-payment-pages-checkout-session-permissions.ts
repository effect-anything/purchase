import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const PaymentPagesCheckoutSessionPermissions = Schema.Struct({
  update_shipping_details: Schema.NullOr(Schema.Literal("client_only", "server_only")),
})
export type PaymentPagesCheckoutSessionPermissions = typeof PaymentPagesCheckoutSessionPermissions.Type
