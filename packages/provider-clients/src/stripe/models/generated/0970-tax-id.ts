import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export type TaxId = {
  readonly country: string | null
  readonly created: number
  readonly customer: string | Models.Customer | null
  readonly customer_account: string | null
  readonly id: string
  readonly livemode: boolean
  readonly object: "tax_id"
  readonly owner: Models.TaxIDsOwner | null
  readonly type:
    | "ad_nrt"
    | "ae_trn"
    | "al_tin"
    | "am_tin"
    | "ao_tin"
    | "ar_cuit"
    | "au_abn"
    | "au_arn"
    | "aw_tin"
    | "az_tin"
    | "ba_tin"
    | "bb_tin"
    | "bd_bin"
    | "bf_ifu"
    | "bg_uic"
    | "bh_vat"
    | "bj_ifu"
    | "bo_tin"
    | "br_cnpj"
    | "br_cpf"
    | "bs_tin"
    | "by_tin"
    | "ca_bn"
    | "ca_gst_hst"
    | "ca_pst_bc"
    | "ca_pst_mb"
    | "ca_pst_sk"
    | "ca_qst"
    | "cd_nif"
    | "ch_uid"
    | "ch_vat"
    | "cl_tin"
    | "cm_niu"
    | "cn_tin"
    | "co_nit"
    | "cr_tin"
    | "cv_nif"
    | "de_stn"
    | "do_rcn"
    | "ec_ruc"
    | "eg_tin"
    | "es_cif"
    | "et_tin"
    | "eu_oss_vat"
    | "eu_vat"
    | "fo_vat"
    | "gb_vat"
    | "ge_vat"
    | "gi_tin"
    | "gn_nif"
    | "hk_br"
    | "hr_oib"
    | "hu_tin"
    | "id_npwp"
    | "il_vat"
    | "in_gst"
    | "is_vat"
    | "it_cf"
    | "jp_cn"
    | "jp_rn"
    | "jp_trn"
    | "ke_pin"
    | "kg_tin"
    | "kh_tin"
    | "kr_brn"
    | "kz_bin"
    | "la_tin"
    | "li_uid"
    | "li_vat"
    | "lk_vat"
    | "ma_vat"
    | "md_vat"
    | "me_pib"
    | "mk_vat"
    | "mr_nif"
    | "mx_rfc"
    | "my_frp"
    | "my_itn"
    | "my_sst"
    | "ng_tin"
    | "no_vat"
    | "no_voec"
    | "np_pan"
    | "nz_gst"
    | "om_vat"
    | "pe_ruc"
    | "ph_tin"
    | "pl_nip"
    | "py_ruc"
    | "ro_tin"
    | "rs_pib"
    | "ru_inn"
    | "ru_kpp"
    | "sa_vat"
    | "sg_gst"
    | "sg_uen"
    | "si_tin"
    | "sn_ninea"
    | "sr_fin"
    | "sv_nit"
    | "th_vat"
    | "tj_tin"
    | "tr_tin"
    | "tw_vat"
    | "tz_vat"
    | "ua_vat"
    | "ug_tin"
    | "unknown"
    | "us_ein"
    | "uy_ruc"
    | "uz_tin"
    | "uz_vat"
    | "ve_rif"
    | "vn_tin"
    | "za_vat"
    | "zm_tin"
    | "zw_tin"
  readonly value: string
  readonly verification: Models.TaxIdVerification | null
}

export const TaxId = Schema.Struct({
  country: Schema.NullOr(Schema.String),
  created: Schema.Number,
  customer: Schema.NullOr(
    Schema.Union(
      Schema.String,
      Schema.suspend(
        (): Schema.Schema<Models.Customer, any, any> => Models.Customer as Schema.Schema<Models.Customer, any, any>
      )
    )
  ),
  customer_account: Schema.NullOr(Schema.String),
  id: Schema.String,
  livemode: Schema.Boolean,
  object: Schema.Literal("tax_id"),
  owner: Schema.NullOr(
    Schema.suspend(
      (): Schema.Schema<Models.TaxIDsOwner, any, any> =>
        Models.TaxIDsOwner as Schema.Schema<Models.TaxIDsOwner, any, any>
    )
  ),
  type: Schema.Literal(
    "ad_nrt",
    "ae_trn",
    "al_tin",
    "am_tin",
    "ao_tin",
    "ar_cuit",
    "au_abn",
    "au_arn",
    "aw_tin",
    "az_tin",
    "ba_tin",
    "bb_tin",
    "bd_bin",
    "bf_ifu",
    "bg_uic",
    "bh_vat",
    "bj_ifu",
    "bo_tin",
    "br_cnpj",
    "br_cpf",
    "bs_tin",
    "by_tin",
    "ca_bn",
    "ca_gst_hst",
    "ca_pst_bc",
    "ca_pst_mb",
    "ca_pst_sk",
    "ca_qst",
    "cd_nif",
    "ch_uid",
    "ch_vat",
    "cl_tin",
    "cm_niu",
    "cn_tin",
    "co_nit",
    "cr_tin",
    "cv_nif",
    "de_stn",
    "do_rcn",
    "ec_ruc",
    "eg_tin",
    "es_cif",
    "et_tin",
    "eu_oss_vat",
    "eu_vat",
    "fo_vat",
    "gb_vat",
    "ge_vat",
    "gi_tin",
    "gn_nif",
    "hk_br",
    "hr_oib",
    "hu_tin",
    "id_npwp",
    "il_vat",
    "in_gst",
    "is_vat",
    "it_cf",
    "jp_cn",
    "jp_rn",
    "jp_trn",
    "ke_pin",
    "kg_tin",
    "kh_tin",
    "kr_brn",
    "kz_bin",
    "la_tin",
    "li_uid",
    "li_vat",
    "lk_vat",
    "ma_vat",
    "md_vat",
    "me_pib",
    "mk_vat",
    "mr_nif",
    "mx_rfc",
    "my_frp",
    "my_itn",
    "my_sst",
    "ng_tin",
    "no_vat",
    "no_voec",
    "np_pan",
    "nz_gst",
    "om_vat",
    "pe_ruc",
    "ph_tin",
    "pl_nip",
    "py_ruc",
    "ro_tin",
    "rs_pib",
    "ru_inn",
    "ru_kpp",
    "sa_vat",
    "sg_gst",
    "sg_uen",
    "si_tin",
    "sn_ninea",
    "sr_fin",
    "sv_nit",
    "th_vat",
    "tj_tin",
    "tr_tin",
    "tw_vat",
    "tz_vat",
    "ua_vat",
    "ug_tin",
    "unknown",
    "us_ein",
    "uy_ruc",
    "uz_tin",
    "uz_vat",
    "ve_rif",
    "vn_tin",
    "za_vat",
    "zm_tin",
    "zw_tin"
  ),
  value: Schema.String,
  verification: Schema.NullOr(
    Schema.suspend(
      (): Schema.Schema<Models.TaxIdVerification, any, any> =>
        Models.TaxIdVerification as Schema.Schema<Models.TaxIdVerification, any, any>
    )
  )
})
