import * as Effect from "effect/Effect"
import * as Schema from "effect/Schema"

import { defineOperation } from "../../../core/operation.ts"
import * as Models from "../../models.ts"
import { StripeClient } from "../../client.ts"

export const PostCheckoutSessionsSessionInput = Schema.Struct({
  session: Schema.String,
  collected_information: Schema.optional(Schema.Struct({
  shipping_details: Schema.optional(Schema.Struct({
  address: Schema.Struct({
  city: Schema.optional(Schema.String),
  country: Schema.String,
  line1: Schema.String,
  line2: Schema.optional(Schema.String),
  postal_code: Schema.optional(Schema.String),
  state: Schema.optional(Schema.String),
}),
  name: Schema.String,
})),
})),
  expand: Schema.optional(Schema.Array(Schema.String)),
  line_items: Schema.optional(Schema.Array(Schema.Struct({
  adjustable_quantity: Schema.optional(Schema.Struct({
  enabled: Schema.Boolean,
  maximum: Schema.optional(Schema.Number),
  minimum: Schema.optional(Schema.Number),
})),
  id: Schema.optional(Schema.String),
  metadata: Schema.optional(Schema.Union(Schema.Record({ key: Schema.String, value: Schema.String }), Schema.Literal(""))),
  price: Schema.optional(Schema.String),
  price_data: Schema.optional(Schema.Struct({
  currency: Schema.String,
  product: Schema.optional(Schema.String),
  product_data: Schema.optional(Schema.Struct({
  description: Schema.optional(Schema.String),
  images: Schema.optional(Schema.Array(Schema.String)),
  metadata: Schema.optional(Schema.Record({ key: Schema.String, value: Schema.String })),
  name: Schema.String,
  tax_code: Schema.optional(Schema.String),
  unit_label: Schema.optional(Schema.String),
})),
  recurring: Schema.optional(Schema.Struct({
  interval: Schema.Literal("day", "month", "week", "year"),
  interval_count: Schema.optional(Schema.Number),
})),
  tax_behavior: Schema.optional(Schema.Literal("exclusive", "inclusive", "unspecified")),
  unit_amount: Schema.optional(Schema.Number),
  unit_amount_decimal: Schema.optional(Schema.String),
})),
  quantity: Schema.optional(Schema.Number),
  tax_rates: Schema.optional(Schema.Union(Schema.Array(Schema.String), Schema.Literal(""))),
}))),
  shipping_options: Schema.optional(Schema.Union(Schema.Array(Schema.Struct({
  shipping_rate: Schema.optional(Schema.String),
  shipping_rate_data: Schema.optional(Schema.Struct({
  delivery_estimate: Schema.optional(Schema.Struct({
  maximum: Schema.optional(Schema.Struct({
  unit: Schema.Literal("business_day", "day", "hour", "month", "week"),
  value: Schema.Number,
})),
  minimum: Schema.optional(Schema.Struct({
  unit: Schema.Literal("business_day", "day", "hour", "month", "week"),
  value: Schema.Number,
})),
})),
  display_name: Schema.String,
  fixed_amount: Schema.optional(Schema.Struct({
  amount: Schema.Number,
  currency: Schema.String,
  currency_options: Schema.optional(Schema.Record({ key: Schema.String, value: Schema.Struct({
  amount: Schema.Number,
  tax_behavior: Schema.optional(Schema.Literal("exclusive", "inclusive", "unspecified")),
}) })),
})),
  metadata: Schema.optional(Schema.Record({ key: Schema.String, value: Schema.String })),
  tax_behavior: Schema.optional(Schema.Literal("exclusive", "inclusive", "unspecified")),
  tax_code: Schema.optional(Schema.String),
  type: Schema.optional(Schema.Literal("fixed_amount")),
})),
})), Schema.Literal(""))),
})
export type PostCheckoutSessionsSessionInput = typeof PostCheckoutSessionsSessionInput.Type

export const PostCheckoutSessionsSessionOutput = Models.CheckoutSession
export type PostCheckoutSessionsSessionOutput = typeof PostCheckoutSessionsSessionOutput.Type

export const postCheckoutSessionsSessionOperation = defineOperation({
  id: "stripe.PostCheckoutSessionsSession",
  method: "POST",
  path: "/v1/checkout/sessions/{session}",
  inputSchema: PostCheckoutSessionsSessionInput,
  outputSchema: PostCheckoutSessionsSessionOutput,
  status: [200],
  contentType: "form",
  pathParams: ["session"],
  bodyParams: ["collected_information", "expand", "line_items", "metadata", "shipping_options"]
})

/**
 * Update a Checkout Session
 */
export const postCheckoutSessionsSession = (input: PostCheckoutSessionsSessionInput) =>
  StripeClient.pipe(Effect.flatMap((client) => client.request(postCheckoutSessionsSessionOperation, input)))
