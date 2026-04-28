import * as Schema from "effect/Schema"

/**
 * App-owned customer identifier. This is safe for public API contracts and
 * should not be confused with provider-native customer ids.
 */
export const CustomerId = Schema.NonEmptyString.pipe(
  Schema.brand("CustomerId"),
  Schema.annotations({
    description: "Application customer unique identifier"
  })
)
export type CustomerId = typeof CustomerId.Type

export const CustomerEmail = Schema.String.pipe(
  Schema.compose(Schema.Lowercase),
  Schema.brand("CustomerEmail"),
  Schema.annotations({
    description: "Customer email address"
  })
)
export type CustomerEmail = typeof CustomerEmail.Type
