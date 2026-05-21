import * as Effect from "effect/Effect"
import * as Schema from "effect/Schema"

import { defineOperation } from "../../../core/operation.ts"
import { StripeClient } from "../../client.ts"
import * as Models from "../../models.ts"

export const PostPricesPriceInput = Schema.Struct({
  price: Schema.String,
  active: Schema.optional(Schema.Boolean),
  currency_options: Schema.optional(
    Schema.Union(
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
      }),
      Schema.Literal("")
    )
  ),
  expand: Schema.optional(Schema.Array(Schema.String)),
  lookup_key: Schema.optional(Schema.String),
  metadata: Schema.optional(
    Schema.Union(Schema.Record({ key: Schema.String, value: Schema.String }), Schema.Literal(""))
  ),
  nickname: Schema.optional(Schema.String),
  transfer_lookup_key: Schema.optional(Schema.Boolean)
})
export type PostPricesPriceInput = typeof PostPricesPriceInput.Type

export const PostPricesPriceOutput = Models.Price
export type PostPricesPriceOutput = typeof PostPricesPriceOutput.Type

export const postPricesPriceOperation = defineOperation({
  id: "stripe.PostPricesPrice",
  method: "POST",
  path: "/v1/prices/{price}",
  inputSchema: PostPricesPriceInput,
  outputSchema: PostPricesPriceOutput,
  status: [200],
  contentType: "form",
  pathParams: ["price"],
  bodyParams: [
    "active",
    "currency_options",
    "expand",
    "lookup_key",
    "metadata",
    "nickname",
    "tax_behavior",
    "transfer_lookup_key"
  ]
})

/**
 * Update a price
 */
export const postPricesPrice = (input: PostPricesPriceInput) =>
  StripeClient.pipe(Effect.flatMap((client) => client.request(postPricesPriceOperation, input)))
