import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const SouthKoreaLocalCardType = Schema.Literal("bc", "citi", "hana", "hyundai", "jeju", "jeonbuk", "kakaobank", "kbank", "kdbbank", "kookmin", "kwangju", "lotte", "mg", "nh", "post", "samsung", "savingsbank", "shinhan", "shinhyup", "suhyup", "tossbank", "unknown", "woori")
export type SouthKoreaLocalCardType = typeof SouthKoreaLocalCardType.Type
