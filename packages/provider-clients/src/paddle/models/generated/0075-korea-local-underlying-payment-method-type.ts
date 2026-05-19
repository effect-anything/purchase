import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const KoreaLocalUnderlyingPaymentMethodType = Schema.Literal("bc", "citi", "hana", "hyundai", "jeju", "jeonbuk", "kakaobank", "kakaopay", "kbank", "kdbbank", "kookmin", "kwangju", "lotte", "mg", "naverpaycard", "naverpaypoint", "nh", "payco", "post", "samsung", "samsungpay", "savingsbank", "shinhan", "shinhyup", "suhyup", "tossbank", "unknown", "woori")
export type KoreaLocalUnderlyingPaymentMethodType = typeof KoreaLocalUnderlyingPaymentMethodType.Type
