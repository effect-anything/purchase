import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const PaymentMethodType = Schema.Literal("alipay", "apple_pay", "bancontact", "blik", "card", "google_pay", "ideal", "kakao_pay", "korea_local", "naver_pay", "payco", "samsung_pay", "south_korea_local_card", "mb_way", "paypal", "pix", "upi", "wechat_pay")
export type PaymentMethodType = typeof PaymentMethodType.Type
