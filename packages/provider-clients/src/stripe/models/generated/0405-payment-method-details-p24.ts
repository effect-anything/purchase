import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const PaymentMethodDetailsP24 = Schema.Struct({
  bank: Schema.NullOr(Schema.Literal("alior_bank", "bank_millennium", "bank_nowy_bfg_sa", "bank_pekao_sa", "banki_spbdzielcze", "blik", "bnp_paribas", "boz", "citi_handlowy", "credit_agricole", "envelobank", "etransfer_pocztowy24", "getin_bank", "ideabank", "ing", "inteligo", "mbank_mtransfer", "nest_przelew", "noble_pay", "pbac_z_ipko", "plus_bank", "santander_przelew24", "tmobile_usbugi_bankowe", "toyota_bank", "velobank", "volkswagen_bank")),
  reference: Schema.NullOr(Schema.String),
  verified_name: Schema.NullOr(Schema.String),
})
export type PaymentMethodDetailsP24 = typeof PaymentMethodDetailsP24.Type
