import * as Effect from "effect/Effect"
import * as Schema from "effect/Schema"

import { defineOperation } from "../../../core/operation.ts"
import { StripeClient } from "../../client.ts"
import * as Models from "../../models.ts"

export const PostCustomersInput = Schema.Struct({
  address: Schema.optional(
    Schema.Union(
      Schema.Struct({
        city: Schema.optional(Schema.String),
        country: Schema.optional(Schema.String),
        line1: Schema.optional(Schema.String),
        line2: Schema.optional(Schema.String),
        postal_code: Schema.optional(Schema.String),
        state: Schema.optional(Schema.String)
      }),
      Schema.Literal("")
    )
  ),
  balance: Schema.optional(Schema.Number),
  business_name: Schema.optional(Schema.Union(Schema.String, Schema.Literal(""))),
  cash_balance: Schema.optional(
    Schema.Struct({
      settings: Schema.optional(
        Schema.Struct({
          reconciliation_mode: Schema.optional(Schema.Literal("automatic", "manual", "merchant_default"))
        })
      )
    })
  ),
  description: Schema.optional(Schema.String),
  email: Schema.optional(Schema.String),
  expand: Schema.optional(Schema.Array(Schema.String)),
  individual_name: Schema.optional(Schema.Union(Schema.String, Schema.Literal(""))),
  invoice_prefix: Schema.optional(Schema.String),
  invoice_settings: Schema.optional(
    Schema.Struct({
      custom_fields: Schema.optional(
        Schema.Union(
          Schema.Array(
            Schema.Struct({
              name: Schema.String,
              value: Schema.String
            })
          ),
          Schema.Literal("")
        )
      ),
      default_payment_method: Schema.optional(Schema.String),
      footer: Schema.optional(Schema.String),
      rendering_options: Schema.optional(
        Schema.Union(
          Schema.Struct({
            amount_tax_display: Schema.optional(Schema.Literal("", "exclude_tax", "include_inclusive_tax")),
            template: Schema.optional(Schema.String)
          }),
          Schema.Literal("")
        )
      )
    })
  ),
  metadata: Schema.optional(
    Schema.Union(Schema.Record({ key: Schema.String, value: Schema.String }), Schema.Literal(""))
  ),
  next_invoice_sequence: Schema.optional(Schema.Number),
  phone: Schema.optional(Schema.String),
  preferred_locales: Schema.optional(Schema.Array(Schema.String)),
  shipping: Schema.optional(
    Schema.Union(
      Schema.Struct({
        address: Schema.Struct({
          city: Schema.optional(Schema.String),
          country: Schema.optional(Schema.String),
          line1: Schema.optional(Schema.String),
          line2: Schema.optional(Schema.String),
          postal_code: Schema.optional(Schema.String),
          state: Schema.optional(Schema.String)
        }),
        name: Schema.String,
        phone: Schema.optional(Schema.String)
      }),
      Schema.Literal("")
    )
  ),
  source: Schema.optional(Schema.String),
  tax: Schema.optional(
    Schema.Struct({
      ip_address: Schema.optional(Schema.Union(Schema.String, Schema.Literal(""))),
      validate_location: Schema.optional(Schema.Literal("deferred", "immediately"))
    })
  ),
  tax_exempt: Schema.optional(Schema.Literal("", "exempt", "none", "reverse")),
  tax_id_data: Schema.optional(
    Schema.Array(
      Schema.Struct({
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
        value: Schema.String
      })
    )
  ),
  test_clock: Schema.optional(Schema.String),
  validate: Schema.optional(Schema.Boolean)
})
export type PostCustomersInput = typeof PostCustomersInput.Type

export const PostCustomersOutput = Models.Customer
export type PostCustomersOutput = typeof PostCustomersOutput.Type

export const postCustomersOperation = defineOperation({
  id: "stripe.PostCustomers",
  method: "POST",
  path: "/v1/customers",
  inputSchema: PostCustomersInput,
  outputSchema: PostCustomersOutput,
  status: [200],
  contentType: "form",
  bodyParams: [
    "address",
    "balance",
    "business_name",
    "cash_balance",
    "description",
    "email",
    "expand",
    "individual_name",
    "invoice_prefix",
    "invoice_settings",
    "metadata",
    "name",
    "next_invoice_sequence",
    "payment_method",
    "phone",
    "preferred_locales",
    "shipping",
    "source",
    "tax",
    "tax_exempt",
    "tax_id_data",
    "test_clock",
    "validate"
  ]
})

/**
 * Create a customer
 */
export const postCustomers = (input: PostCustomersInput) =>
  StripeClient.pipe(Effect.flatMap((client) => client.request(postCustomersOperation, input)))
