import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const CustomerPaymentMethodType = Schema.Literal(
  "alipay",
  "apple_pay",
  "blik",
  "card",
  "google_pay",
  "kakao_pay",
  "korea_local",
  "south_korea_local_card",
  "mb_way",
  "naver_pay",
  "payco",
  "paypal",
  "pix",
  "samsung_pay",
  "upi",
  "wechat_pay"
)
export type CustomerPaymentMethodType = typeof CustomerPaymentMethodType.Type
