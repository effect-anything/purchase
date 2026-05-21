import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const RefundDestinationDetails = Schema.Struct({
  affirm: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.DestinationDetailsUnimplemented, any, any> =>
        Models.DestinationDetailsUnimplemented as Schema.Schema<Models.DestinationDetailsUnimplemented, any, any>
    )
  ),
  afterpay_clearpay: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.DestinationDetailsUnimplemented, any, any> =>
        Models.DestinationDetailsUnimplemented as Schema.Schema<Models.DestinationDetailsUnimplemented, any, any>
    )
  ),
  alipay: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.DestinationDetailsUnimplemented, any, any> =>
        Models.DestinationDetailsUnimplemented as Schema.Schema<Models.DestinationDetailsUnimplemented, any, any>
    )
  ),
  alma: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.DestinationDetailsUnimplemented, any, any> =>
        Models.DestinationDetailsUnimplemented as Schema.Schema<Models.DestinationDetailsUnimplemented, any, any>
    )
  ),
  amazon_pay: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.DestinationDetailsUnimplemented, any, any> =>
        Models.DestinationDetailsUnimplemented as Schema.Schema<Models.DestinationDetailsUnimplemented, any, any>
    )
  ),
  au_bank_transfer: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.DestinationDetailsUnimplemented, any, any> =>
        Models.DestinationDetailsUnimplemented as Schema.Schema<Models.DestinationDetailsUnimplemented, any, any>
    )
  ),
  blik: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.RefundDestinationDetailsBlik, any, any> =>
        Models.RefundDestinationDetailsBlik as Schema.Schema<Models.RefundDestinationDetailsBlik, any, any>
    )
  ),
  br_bank_transfer: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.RefundDestinationDetailsBrBankTransfer, any, any> =>
        Models.RefundDestinationDetailsBrBankTransfer as Schema.Schema<
          Models.RefundDestinationDetailsBrBankTransfer,
          any,
          any
        >
    )
  ),
  card: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.RefundDestinationDetailsCard, any, any> =>
        Models.RefundDestinationDetailsCard as Schema.Schema<Models.RefundDestinationDetailsCard, any, any>
    )
  ),
  cashapp: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.DestinationDetailsUnimplemented, any, any> =>
        Models.DestinationDetailsUnimplemented as Schema.Schema<Models.DestinationDetailsUnimplemented, any, any>
    )
  ),
  crypto: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.RefundDestinationDetailsCrypto, any, any> =>
        Models.RefundDestinationDetailsCrypto as Schema.Schema<Models.RefundDestinationDetailsCrypto, any, any>
    )
  ),
  customer_cash_balance: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.DestinationDetailsUnimplemented, any, any> =>
        Models.DestinationDetailsUnimplemented as Schema.Schema<Models.DestinationDetailsUnimplemented, any, any>
    )
  ),
  eps: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.DestinationDetailsUnimplemented, any, any> =>
        Models.DestinationDetailsUnimplemented as Schema.Schema<Models.DestinationDetailsUnimplemented, any, any>
    )
  ),
  eu_bank_transfer: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.RefundDestinationDetailsEuBankTransfer, any, any> =>
        Models.RefundDestinationDetailsEuBankTransfer as Schema.Schema<
          Models.RefundDestinationDetailsEuBankTransfer,
          any,
          any
        >
    )
  ),
  gb_bank_transfer: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.RefundDestinationDetailsGbBankTransfer, any, any> =>
        Models.RefundDestinationDetailsGbBankTransfer as Schema.Schema<
          Models.RefundDestinationDetailsGbBankTransfer,
          any,
          any
        >
    )
  ),
  giropay: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.DestinationDetailsUnimplemented, any, any> =>
        Models.DestinationDetailsUnimplemented as Schema.Schema<Models.DestinationDetailsUnimplemented, any, any>
    )
  ),
  grabpay: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.DestinationDetailsUnimplemented, any, any> =>
        Models.DestinationDetailsUnimplemented as Schema.Schema<Models.DestinationDetailsUnimplemented, any, any>
    )
  ),
  jp_bank_transfer: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.RefundDestinationDetailsJpBankTransfer, any, any> =>
        Models.RefundDestinationDetailsJpBankTransfer as Schema.Schema<
          Models.RefundDestinationDetailsJpBankTransfer,
          any,
          any
        >
    )
  ),
  klarna: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.DestinationDetailsUnimplemented, any, any> =>
        Models.DestinationDetailsUnimplemented as Schema.Schema<Models.DestinationDetailsUnimplemented, any, any>
    )
  ),
  mb_way: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.RefundDestinationDetailsMbWay, any, any> =>
        Models.RefundDestinationDetailsMbWay as Schema.Schema<Models.RefundDestinationDetailsMbWay, any, any>
    )
  ),
  multibanco: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.RefundDestinationDetailsMultibanco, any, any> =>
        Models.RefundDestinationDetailsMultibanco as Schema.Schema<Models.RefundDestinationDetailsMultibanco, any, any>
    )
  ),
  mx_bank_transfer: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.RefundDestinationDetailsMxBankTransfer, any, any> =>
        Models.RefundDestinationDetailsMxBankTransfer as Schema.Schema<
          Models.RefundDestinationDetailsMxBankTransfer,
          any,
          any
        >
    )
  ),
  nz_bank_transfer: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.DestinationDetailsUnimplemented, any, any> =>
        Models.DestinationDetailsUnimplemented as Schema.Schema<Models.DestinationDetailsUnimplemented, any, any>
    )
  ),
  p24: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.RefundDestinationDetailsP24, any, any> =>
        Models.RefundDestinationDetailsP24 as Schema.Schema<Models.RefundDestinationDetailsP24, any, any>
    )
  ),
  paynow: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.DestinationDetailsUnimplemented, any, any> =>
        Models.DestinationDetailsUnimplemented as Schema.Schema<Models.DestinationDetailsUnimplemented, any, any>
    )
  ),
  paypal: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.RefundDestinationDetailsPaypal, any, any> =>
        Models.RefundDestinationDetailsPaypal as Schema.Schema<Models.RefundDestinationDetailsPaypal, any, any>
    )
  ),
  pix: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.DestinationDetailsUnimplemented, any, any> =>
        Models.DestinationDetailsUnimplemented as Schema.Schema<Models.DestinationDetailsUnimplemented, any, any>
    )
  ),
  revolut: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.DestinationDetailsUnimplemented, any, any> =>
        Models.DestinationDetailsUnimplemented as Schema.Schema<Models.DestinationDetailsUnimplemented, any, any>
    )
  ),
  sofort: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.DestinationDetailsUnimplemented, any, any> =>
        Models.DestinationDetailsUnimplemented as Schema.Schema<Models.DestinationDetailsUnimplemented, any, any>
    )
  ),
  swish: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.RefundDestinationDetailsSwish, any, any> =>
        Models.RefundDestinationDetailsSwish as Schema.Schema<Models.RefundDestinationDetailsSwish, any, any>
    )
  ),
  th_bank_transfer: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.RefundDestinationDetailsThBankTransfer, any, any> =>
        Models.RefundDestinationDetailsThBankTransfer as Schema.Schema<
          Models.RefundDestinationDetailsThBankTransfer,
          any,
          any
        >
    )
  ),
  twint: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.DestinationDetailsUnimplemented, any, any> =>
        Models.DestinationDetailsUnimplemented as Schema.Schema<Models.DestinationDetailsUnimplemented, any, any>
    )
  ),
  type: Schema.String,
  us_bank_transfer: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.RefundDestinationDetailsUsBankTransfer, any, any> =>
        Models.RefundDestinationDetailsUsBankTransfer as Schema.Schema<
          Models.RefundDestinationDetailsUsBankTransfer,
          any,
          any
        >
    )
  ),
  wechat_pay: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.DestinationDetailsUnimplemented, any, any> =>
        Models.DestinationDetailsUnimplemented as Schema.Schema<Models.DestinationDetailsUnimplemented, any, any>
    )
  ),
  zip: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.DestinationDetailsUnimplemented, any, any> =>
        Models.DestinationDetailsUnimplemented as Schema.Schema<Models.DestinationDetailsUnimplemented, any, any>
    )
  )
})
export type RefundDestinationDetails = typeof RefundDestinationDetails.Type
