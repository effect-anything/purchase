import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const SourceTypeKlarna = Schema.Struct({
  background_image_url: Schema.optional(Schema.String),
  client_token: Schema.optional(Schema.NullOr(Schema.String)),
  first_name: Schema.optional(Schema.String),
  last_name: Schema.optional(Schema.String),
  locale: Schema.optional(Schema.String),
  logo_url: Schema.optional(Schema.String),
  page_title: Schema.optional(Schema.String),
  pay_later_asset_urls_descriptive: Schema.optional(Schema.String),
  pay_later_asset_urls_standard: Schema.optional(Schema.String),
  pay_later_name: Schema.optional(Schema.String),
  pay_later_redirect_url: Schema.optional(Schema.String),
  pay_now_asset_urls_descriptive: Schema.optional(Schema.String),
  pay_now_asset_urls_standard: Schema.optional(Schema.String),
  pay_now_name: Schema.optional(Schema.String),
  pay_now_redirect_url: Schema.optional(Schema.String),
  pay_over_time_asset_urls_descriptive: Schema.optional(Schema.String),
  pay_over_time_asset_urls_standard: Schema.optional(Schema.String),
  pay_over_time_name: Schema.optional(Schema.String),
  pay_over_time_redirect_url: Schema.optional(Schema.String),
  payment_method_categories: Schema.optional(Schema.String),
  purchase_country: Schema.optional(Schema.String),
  purchase_type: Schema.optional(Schema.String),
  redirect_url: Schema.optional(Schema.String),
  shipping_delay: Schema.optional(Schema.Number),
  shipping_first_name: Schema.optional(Schema.String),
  shipping_last_name: Schema.optional(Schema.String)
})
export type SourceTypeKlarna = typeof SourceTypeKlarna.Type
