import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const PaymentMethodDetailsCrypto = Schema.Struct({
  buyer_address: Schema.optional(Schema.String),
  network: Schema.optional(Schema.Literal("base", "ethereum", "polygon", "solana", "tempo")),
  token_currency: Schema.optional(Schema.Literal("phantom_cash", "usdc", "usdg", "usdp", "usdt")),
  transaction_hash: Schema.optional(Schema.String)
})
export type PaymentMethodDetailsCrypto = typeof PaymentMethodDetailsCrypto.Type
