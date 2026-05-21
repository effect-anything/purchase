import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export type Card = {
  readonly account?: string | Models.Account | null
  readonly address_city: string | null
  readonly address_country: string | null
  readonly address_line1: string | null
  readonly address_line1_check: string | null
  readonly address_line2: string | null
  readonly address_state: string | null
  readonly address_zip: string | null
  readonly address_zip_check: string | null
  readonly allow_redisplay?: "always" | "limited" | "unspecified" | null
  readonly available_payout_methods?: ReadonlyArray<"instant" | "standard"> | null
  readonly brand: string
  readonly country: string | null
  readonly currency?: string | null
  readonly customer?: string | Models.Customer | Models.DeletedCustomer | null
  readonly cvc_check: string | null
  readonly default_for_currency?: boolean | null
  readonly description?: string
  readonly dynamic_last4: string | null
  readonly exp_month: number
  readonly exp_year: number
  readonly fingerprint?: string | null
  readonly funding: string
  readonly id: string
  readonly iin?: string
  readonly issuer?: string
  readonly last4: string
  readonly metadata: Readonly<Record<string, string>> | null
  readonly name: string | null
  readonly networks?: Models.TokenCardNetworks
  readonly object: "card"
  readonly regulated_status: "regulated" | "unregulated" | null
  readonly status?: string | null
  readonly tokenization_method: string | null
}

export const Card = Schema.Struct({
  account: Schema.optional(
    Schema.NullOr(
      Schema.Union(
        Schema.String,
        Schema.suspend(
          (): Schema.Schema<Models.Account, any, any> => Models.Account as Schema.Schema<Models.Account, any, any>
        )
      )
    )
  ),
  address_city: Schema.NullOr(Schema.String),
  address_country: Schema.NullOr(Schema.String),
  address_line1: Schema.NullOr(Schema.String),
  address_line1_check: Schema.NullOr(Schema.String),
  address_line2: Schema.NullOr(Schema.String),
  address_state: Schema.NullOr(Schema.String),
  address_zip: Schema.NullOr(Schema.String),
  address_zip_check: Schema.NullOr(Schema.String),
  allow_redisplay: Schema.optional(Schema.NullOr(Schema.Literal("always", "limited", "unspecified"))),
  available_payout_methods: Schema.optional(Schema.NullOr(Schema.Array(Schema.Literal("instant", "standard")))),
  brand: Schema.String,
  country: Schema.NullOr(Schema.String),
  currency: Schema.optional(Schema.NullOr(Schema.String)),
  customer: Schema.optional(
    Schema.NullOr(
      Schema.Union(
        Schema.String,
        Schema.suspend(
          (): Schema.Schema<Models.Customer, any, any> => Models.Customer as Schema.Schema<Models.Customer, any, any>
        ),
        Schema.suspend(
          (): Schema.Schema<Models.DeletedCustomer, any, any> =>
            Models.DeletedCustomer as Schema.Schema<Models.DeletedCustomer, any, any>
        )
      )
    )
  ),
  cvc_check: Schema.NullOr(Schema.String),
  default_for_currency: Schema.optional(Schema.NullOr(Schema.Boolean)),
  description: Schema.optional(Schema.String),
  dynamic_last4: Schema.NullOr(Schema.String),
  exp_month: Schema.Number,
  exp_year: Schema.Number,
  fingerprint: Schema.optional(Schema.NullOr(Schema.String)),
  funding: Schema.String,
  id: Schema.String,
  iin: Schema.optional(Schema.String),
  issuer: Schema.optional(Schema.String),
  last4: Schema.String,
  metadata: Schema.NullOr(Schema.Record({ key: Schema.String, value: Schema.String })),
  name: Schema.NullOr(Schema.String),
  networks: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.TokenCardNetworks, any, any> =>
        Models.TokenCardNetworks as Schema.Schema<Models.TokenCardNetworks, any, any>
    )
  ),
  object: Schema.Literal("card"),
  regulated_status: Schema.NullOr(Schema.Literal("regulated", "unregulated")),
  status: Schema.optional(Schema.NullOr(Schema.String)),
  tokenization_method: Schema.NullOr(Schema.String)
})
