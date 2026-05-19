import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const PaymentMethodOptionsWechatPay = Schema.Struct({
  app_id: Schema.NullOr(Schema.String),
  client: Schema.NullOr(Schema.Literal("android", "ios", "web")),
  setup_future_usage: Schema.optional(Schema.Literal("none")),
})
export type PaymentMethodOptionsWechatPay = typeof PaymentMethodOptionsWechatPay.Type
