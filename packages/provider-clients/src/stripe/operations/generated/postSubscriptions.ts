import * as Effect from "effect/Effect"
import * as Schema from "effect/Schema"

import { defineOperation } from "../../../core/operation.ts"
import { StripeClient } from "../../client.ts"
import * as Models from "../../models.ts"

export const PostSubscriptionsInput = Schema.Struct({
  add_invoice_items: Schema.optional(
    Schema.Array(
      Schema.Struct({
        discounts: Schema.optional(
          Schema.Array(
            Schema.Struct({
              coupon: Schema.optional(Schema.String),
              discount: Schema.optional(Schema.String),
              promotion_code: Schema.optional(Schema.String)
            })
          )
        ),
        metadata: Schema.optional(Schema.Record({ key: Schema.String, value: Schema.String })),
        period: Schema.optional(
          Schema.Struct({
            end: Schema.Struct({
              timestamp: Schema.optional(Schema.Number),
              type: Schema.Literal("min_item_period_end", "timestamp")
            }),
            start: Schema.Struct({
              timestamp: Schema.optional(Schema.Number),
              type: Schema.Literal("max_item_period_start", "now", "timestamp")
            })
          })
        ),
        price: Schema.optional(Schema.String),
        price_data: Schema.optional(
          Schema.Struct({
            currency: Schema.String,
            product: Schema.String,
            tax_behavior: Schema.optional(Schema.Literal("exclusive", "inclusive", "unspecified")),
            unit_amount: Schema.optional(Schema.Number),
            unit_amount_decimal: Schema.optional(Schema.String)
          })
        ),
        quantity: Schema.optional(Schema.Number),
        tax_rates: Schema.optional(Schema.Union(Schema.Array(Schema.String), Schema.Literal("")))
      })
    )
  ),
  application_fee_percent: Schema.optional(Schema.Union(Schema.Number, Schema.Literal(""))),
  automatic_tax: Schema.optional(
    Schema.Struct({
      enabled: Schema.Boolean,
      liability: Schema.optional(
        Schema.Struct({
          account: Schema.optional(Schema.String),
          type: Schema.Literal("account", "self")
        })
      )
    })
  ),
  backdate_start_date: Schema.optional(Schema.Number),
  billing_cycle_anchor: Schema.optional(Schema.Number),
  billing_cycle_anchor_config: Schema.optional(
    Schema.Struct({
      day_of_month: Schema.Number,
      hour: Schema.optional(Schema.Number),
      minute: Schema.optional(Schema.Number),
      month: Schema.optional(Schema.Number),
      second: Schema.optional(Schema.Number)
    })
  ),
  billing_mode: Schema.optional(
    Schema.Struct({
      flexible: Schema.optional(
        Schema.Struct({
          proration_discounts: Schema.optional(Schema.Literal("included", "itemized"))
        })
      ),
      type: Schema.Literal("classic", "flexible")
    })
  ),
  billing_thresholds: Schema.optional(
    Schema.Union(
      Schema.Struct({
        amount_gte: Schema.optional(Schema.Number),
        reset_billing_cycle_anchor: Schema.optional(Schema.Boolean)
      }),
      Schema.Literal("")
    )
  ),
  cancel_at: Schema.optional(Schema.Union(Schema.Number, Schema.Literal("max_period_end", "min_period_end"))),
  cancel_at_period_end: Schema.optional(Schema.Boolean),
  collection_method: Schema.optional(Schema.Literal("charge_automatically", "send_invoice")),
  customer: Schema.optional(Schema.String),
  customer_account: Schema.optional(Schema.String),
  days_until_due: Schema.optional(Schema.Number),
  default_payment_method: Schema.optional(Schema.String),
  default_source: Schema.optional(Schema.String),
  default_tax_rates: Schema.optional(Schema.Union(Schema.Array(Schema.String), Schema.Literal(""))),
  description: Schema.optional(Schema.String),
  expand: Schema.optional(Schema.Array(Schema.String)),
  invoice_settings: Schema.optional(
    Schema.Struct({
      account_tax_ids: Schema.optional(Schema.Union(Schema.Array(Schema.String), Schema.Literal(""))),
      issuer: Schema.optional(
        Schema.Struct({
          account: Schema.optional(Schema.String),
          type: Schema.Literal("account", "self")
        })
      )
    })
  ),
  off_session: Schema.optional(Schema.Boolean),
  on_behalf_of: Schema.optional(Schema.Union(Schema.String, Schema.Literal(""))),
  payment_behavior: Schema.optional(
    Schema.Literal("allow_incomplete", "default_incomplete", "error_if_incomplete", "pending_if_incomplete")
  ),
  payment_settings: Schema.optional(
    Schema.Struct({
      payment_method_options: Schema.optional(
        Schema.Struct({
          acss_debit: Schema.optional(
            Schema.Union(
              Schema.Struct({
                mandate_options: Schema.optional(
                  Schema.Struct({
                    transaction_type: Schema.optional(Schema.Literal("business", "personal"))
                  })
                ),
                verification_method: Schema.optional(Schema.Literal("automatic", "instant", "microdeposits"))
              }),
              Schema.Literal("")
            )
          ),
          bancontact: Schema.optional(
            Schema.Union(
              Schema.Struct({
                preferred_language: Schema.optional(Schema.Literal("de", "en", "fr", "nl"))
              }),
              Schema.Literal("")
            )
          ),
          card: Schema.optional(
            Schema.Union(
              Schema.Struct({
                mandate_options: Schema.optional(
                  Schema.Struct({
                    amount: Schema.optional(Schema.Number),
                    amount_type: Schema.optional(Schema.Literal("fixed", "maximum")),
                    description: Schema.optional(Schema.String)
                  })
                ),
                network: Schema.optional(
                  Schema.Literal(
                    "amex",
                    "cartes_bancaires",
                    "diners",
                    "discover",
                    "eftpos_au",
                    "girocard",
                    "interac",
                    "jcb",
                    "link",
                    "mastercard",
                    "unionpay",
                    "unknown",
                    "visa"
                  )
                ),
                request_three_d_secure: Schema.optional(Schema.Literal("any", "automatic", "challenge"))
              }),
              Schema.Literal("")
            )
          ),
          customer_balance: Schema.optional(
            Schema.Union(
              Schema.Struct({
                bank_transfer: Schema.optional(
                  Schema.Struct({
                    eu_bank_transfer: Schema.optional(
                      Schema.Struct({
                        country: Schema.String
                      })
                    ),
                    type: Schema.optional(Schema.String)
                  })
                ),
                funding_type: Schema.optional(Schema.String)
              }),
              Schema.Literal("")
            )
          ),
          konbini: Schema.optional(Schema.Union(Schema.Struct({}), Schema.Literal(""))),
          payto: Schema.optional(
            Schema.Union(
              Schema.Struct({
                mandate_options: Schema.optional(
                  Schema.Struct({
                    amount: Schema.optional(Schema.Number),
                    purpose: Schema.optional(
                      Schema.Literal(
                        "dependant_support",
                        "government",
                        "loan",
                        "mortgage",
                        "other",
                        "pension",
                        "personal",
                        "retail",
                        "salary",
                        "tax",
                        "utility"
                      )
                    )
                  })
                )
              }),
              Schema.Literal("")
            )
          ),
          pix: Schema.optional(
            Schema.Union(
              Schema.Struct({
                expires_after_seconds: Schema.optional(Schema.Number),
                mandate_options: Schema.optional(
                  Schema.Struct({
                    amount: Schema.optional(Schema.Number),
                    amount_includes_iof: Schema.optional(Schema.Literal("always", "never")),
                    end_date: Schema.optional(Schema.String),
                    payment_schedule: Schema.optional(
                      Schema.Literal("halfyearly", "monthly", "quarterly", "weekly", "yearly")
                    )
                  })
                )
              }),
              Schema.Literal("")
            )
          ),
          sepa_debit: Schema.optional(Schema.Union(Schema.Struct({}), Schema.Literal(""))),
          upi: Schema.optional(
            Schema.Union(
              Schema.Struct({
                mandate_options: Schema.optional(
                  Schema.Struct({
                    amount: Schema.optional(Schema.Number),
                    amount_type: Schema.optional(Schema.Literal("fixed", "maximum")),
                    description: Schema.optional(Schema.String),
                    end_date: Schema.optional(Schema.Number)
                  })
                )
              }),
              Schema.Literal("")
            )
          ),
          us_bank_account: Schema.optional(
            Schema.Union(
              Schema.Struct({
                financial_connections: Schema.optional(
                  Schema.Struct({
                    filters: Schema.optional(
                      Schema.Struct({
                        account_subcategories: Schema.optional(Schema.Array(Schema.Literal("checking", "savings")))
                      })
                    ),
                    permissions: Schema.optional(
                      Schema.Array(Schema.Literal("balances", "ownership", "payment_method", "transactions"))
                    ),
                    prefetch: Schema.optional(Schema.Array(Schema.Literal("balances", "ownership", "transactions")))
                  })
                ),
                verification_method: Schema.optional(Schema.Literal("automatic", "instant", "microdeposits"))
              }),
              Schema.Literal("")
            )
          )
        })
      ),
      payment_method_types: Schema.optional(
        Schema.Union(
          Schema.Array(
            Schema.Literal(
              "ach_credit_transfer",
              "ach_debit",
              "acss_debit",
              "affirm",
              "amazon_pay",
              "au_becs_debit",
              "bacs_debit",
              "bancontact",
              "boleto",
              "card",
              "cashapp",
              "crypto",
              "custom",
              "customer_balance",
              "eps",
              "fpx",
              "giropay",
              "grabpay",
              "ideal",
              "jp_credit_transfer",
              "kakao_pay",
              "klarna",
              "konbini",
              "kr_card",
              "link",
              "multibanco",
              "naver_pay",
              "nz_bank_account",
              "p24",
              "pay_by_bank",
              "payco",
              "paynow",
              "paypal",
              "payto",
              "pix",
              "promptpay",
              "revolut_pay",
              "sepa_credit_transfer",
              "sepa_debit",
              "sofort",
              "swish",
              "upi",
              "us_bank_account",
              "wechat_pay"
            )
          ),
          Schema.Literal("")
        )
      ),
      save_default_payment_method: Schema.optional(Schema.Literal("off", "on_subscription"))
    })
  ),
  pending_invoice_item_interval: Schema.optional(
    Schema.Union(
      Schema.Struct({
        interval: Schema.Literal("day", "month", "week", "year"),
        interval_count: Schema.optional(Schema.Number)
      }),
      Schema.Literal("")
    )
  ),
  proration_behavior: Schema.optional(Schema.Literal("always_invoice", "create_prorations", "none")),
  transfer_data: Schema.optional(
    Schema.Struct({
      amount_percent: Schema.optional(Schema.Number),
      destination: Schema.String
    })
  ),
  trial_end: Schema.optional(Schema.Union(Schema.Literal("now"), Schema.Number)),
  trial_from_plan: Schema.optional(Schema.Boolean),
  trial_period_days: Schema.optional(Schema.Number),
  trial_settings: Schema.optional(
    Schema.Struct({
      end_behavior: Schema.Struct({
        missing_payment_method: Schema.Literal("cancel", "create_invoice", "pause")
      })
    })
  )
})
export type PostSubscriptionsInput = typeof PostSubscriptionsInput.Type

export const PostSubscriptionsOutput = Models.Subscription
export type PostSubscriptionsOutput = typeof PostSubscriptionsOutput.Type

export const postSubscriptionsOperation = defineOperation({
  id: "stripe.PostSubscriptions",
  method: "POST",
  path: "/v1/subscriptions",
  inputSchema: PostSubscriptionsInput,
  outputSchema: PostSubscriptionsOutput,
  status: [200],
  contentType: "form",
  bodyParams: [
    "add_invoice_items",
    "application_fee_percent",
    "automatic_tax",
    "backdate_start_date",
    "billing_cycle_anchor",
    "billing_cycle_anchor_config",
    "billing_mode",
    "billing_thresholds",
    "cancel_at",
    "cancel_at_period_end",
    "collection_method",
    "currency",
    "customer",
    "customer_account",
    "days_until_due",
    "default_payment_method",
    "default_source",
    "default_tax_rates",
    "description",
    "discounts",
    "expand",
    "invoice_settings",
    "items",
    "metadata",
    "off_session",
    "on_behalf_of",
    "payment_behavior",
    "payment_settings",
    "pending_invoice_item_interval",
    "proration_behavior",
    "transfer_data",
    "trial_end",
    "trial_from_plan",
    "trial_period_days",
    "trial_settings"
  ]
})

/**
 * Create a subscription
 */
export const postSubscriptions = (input: PostSubscriptionsInput) =>
  StripeClient.pipe(Effect.flatMap((client) => client.request(postSubscriptionsOperation, input)))
