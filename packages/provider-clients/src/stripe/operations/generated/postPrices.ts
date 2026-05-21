import * as Effect from "effect/Effect"
import * as Schema from "effect/Schema"

import { defineOperation } from "../../../core/operation.ts"
import { StripeClient } from "../../client.ts"
import * as Models from "../../models.ts"

export const PostPricesInput = Schema.Struct({
  active: Schema.optional(Schema.Boolean),
  billing_scheme: Schema.optional(Schema.Literal("per_unit", "tiered")),
  currency: Schema.String,
  currency_options: Schema.optional(
    Schema.Record({
      key: Schema.String,
      value: Schema.Struct({
        custom_unit_amount: Schema.optional(
          Schema.Struct({
            enabled: Schema.Boolean,
            maximum: Schema.optional(Schema.Number),
            minimum: Schema.optional(Schema.Number),
            preset: Schema.optional(Schema.Number)
          })
        ),
        tax_behavior: Schema.optional(Schema.Literal("exclusive", "inclusive", "unspecified")),
        tiers: Schema.optional(
          Schema.Array(
            Schema.Struct({
              flat_amount: Schema.optional(Schema.Number),
              flat_amount_decimal: Schema.optional(Schema.String),
              unit_amount: Schema.optional(Schema.Number),
              unit_amount_decimal: Schema.optional(Schema.String),
              up_to: Schema.Union(Schema.Literal("inf"), Schema.Number)
            })
          )
        ),
        unit_amount: Schema.optional(Schema.Number),
        unit_amount_decimal: Schema.optional(Schema.String)
      })
    })
  ),
  expand: Schema.optional(Schema.Array(Schema.String)),
  lookup_key: Schema.optional(Schema.String),
  metadata: Schema.optional(Schema.Record({ key: Schema.String, value: Schema.String })),
  nickname: Schema.optional(Schema.String),
  product: Schema.optional(Schema.String),
  product_data: Schema.optional(
    Schema.Struct({
      active: Schema.optional(Schema.Boolean),
      id: Schema.optional(Schema.String),
      metadata: Schema.optional(Schema.Record({ key: Schema.String, value: Schema.String })),
      name: Schema.String,
      statement_descriptor: Schema.optional(Schema.String),
      tax_code: Schema.optional(Schema.String),
      unit_label: Schema.optional(Schema.String)
    })
  ),
  recurring: Schema.optional(
    Schema.Struct({
      interval: Schema.Literal("day", "month", "week", "year"),
      interval_count: Schema.optional(Schema.Number),
      meter: Schema.optional(Schema.String),
      trial_period_days: Schema.optional(Schema.Number),
      usage_type: Schema.optional(Schema.Literal("licensed", "metered"))
    })
  ),
  tiers_mode: Schema.optional(Schema.Literal("graduated", "volume")),
  transfer_lookup_key: Schema.optional(Schema.Boolean),
  transform_quantity: Schema.optional(
    Schema.Struct({
      divide_by: Schema.Number,
      round: Schema.Literal("down", "up")
    })
  )
})
export type PostPricesInput = typeof PostPricesInput.Type

export const PostPricesOutput = Models.Price
export type PostPricesOutput = typeof PostPricesOutput.Type

export const postPricesOperation = defineOperation({
  id: "stripe.PostPrices",
  method: "POST",
  path: "/v1/prices",
  inputSchema: PostPricesInput,
  outputSchema: PostPricesOutput,
  status: [200],
  contentType: "form",
  bodyParams: [
    "active",
    "billing_scheme",
    "currency",
    "currency_options",
    "custom_unit_amount",
    "expand",
    "lookup_key",
    "metadata",
    "nickname",
    "product",
    "product_data",
    "recurring",
    "tax_behavior",
    "tiers",
    "tiers_mode",
    "transfer_lookup_key",
    "transform_quantity",
    "unit_amount",
    "unit_amount_decimal"
  ]
})

/**
 * Create a price
 */
export const postPrices = (input: PostPricesInput) =>
  StripeClient.pipe(Effect.flatMap((client) => client.request(postPricesOperation, input)))
