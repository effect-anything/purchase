import * as Effect from "effect/Effect"
import * as Schema from "effect/Schema"

import { defineOperation } from "../../../core/operation.ts"
import { StripeClient } from "../../client.ts"
import * as Models from "../../models.ts"

export const PostProductsInput = Schema.Struct({
  active: Schema.optional(Schema.Boolean),
  default_price_data: Schema.optional(
    Schema.Struct({
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
      custom_unit_amount: Schema.optional(
        Schema.Struct({
          enabled: Schema.Boolean,
          maximum: Schema.optional(Schema.Number),
          minimum: Schema.optional(Schema.Number),
          preset: Schema.optional(Schema.Number)
        })
      ),
      metadata: Schema.optional(Schema.Record({ key: Schema.String, value: Schema.String })),
      recurring: Schema.optional(
        Schema.Struct({
          interval: Schema.Literal("day", "month", "week", "year"),
          interval_count: Schema.optional(Schema.Number)
        })
      ),
      tax_behavior: Schema.optional(Schema.Literal("exclusive", "inclusive", "unspecified")),
      unit_amount: Schema.optional(Schema.Number),
      unit_amount_decimal: Schema.optional(Schema.String)
    })
  ),
  description: Schema.optional(Schema.String),
  expand: Schema.optional(Schema.Array(Schema.String)),
  id: Schema.optional(Schema.String),
  images: Schema.optional(Schema.Array(Schema.String)),
  marketing_features: Schema.optional(
    Schema.Array(
      Schema.Struct({
        name: Schema.String
      })
    )
  ),
  package_dimensions: Schema.optional(
    Schema.Struct({
      height: Schema.Number,
      length: Schema.Number,
      weight: Schema.Number,
      width: Schema.Number
    })
  ),
  shippable: Schema.optional(Schema.Boolean),
  statement_descriptor: Schema.optional(Schema.String),
  tax_code: Schema.optional(Schema.String),
  type: Schema.optional(Schema.Literal("good", "service")),
  unit_label: Schema.optional(Schema.String),
  url: Schema.optional(Schema.String)
})
export type PostProductsInput = typeof PostProductsInput.Type

export const PostProductsOutput = Models.Product
export type PostProductsOutput = typeof PostProductsOutput.Type

export const postProductsOperation = defineOperation({
  id: "stripe.PostProducts",
  method: "POST",
  path: "/v1/products",
  inputSchema: PostProductsInput,
  outputSchema: PostProductsOutput,
  status: [200],
  contentType: "form",
  bodyParams: [
    "active",
    "default_price_data",
    "description",
    "expand",
    "id",
    "images",
    "marketing_features",
    "metadata",
    "name",
    "package_dimensions",
    "shippable",
    "statement_descriptor",
    "tax_code",
    "type",
    "unit_label",
    "url"
  ]
})

/**
 * Create a product
 */
export const postProducts = (input: PostProductsInput) =>
  StripeClient.pipe(Effect.flatMap((client) => client.request(postProductsOperation, input)))
