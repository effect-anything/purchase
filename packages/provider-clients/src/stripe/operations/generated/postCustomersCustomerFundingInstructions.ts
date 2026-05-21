import * as Effect from "effect/Effect"
import * as Schema from "effect/Schema"

import { defineOperation } from "../../../core/operation.ts"
import { StripeClient } from "../../client.ts"
import * as Models from "../../models.ts"

export const PostCustomersCustomerFundingInstructionsInput = Schema.Struct({
  customer: Schema.String,
  bank_transfer: Schema.Struct({
    eu_bank_transfer: Schema.optional(
      Schema.Struct({
        country: Schema.String
      })
    ),
    requested_address_types: Schema.optional(Schema.Array(Schema.Literal("iban", "sort_code", "spei", "zengin"))),
    type: Schema.Literal(
      "eu_bank_transfer",
      "gb_bank_transfer",
      "jp_bank_transfer",
      "mx_bank_transfer",
      "us_bank_transfer"
    )
  }),
  currency: Schema.String,
  expand: Schema.optional(Schema.Array(Schema.String)),
  funding_type: Schema.Literal("bank_transfer")
})
export type PostCustomersCustomerFundingInstructionsInput = typeof PostCustomersCustomerFundingInstructionsInput.Type

export const PostCustomersCustomerFundingInstructionsOutput = Models.FundingInstructions
export type PostCustomersCustomerFundingInstructionsOutput = typeof PostCustomersCustomerFundingInstructionsOutput.Type

export const postCustomersCustomerFundingInstructionsOperation = defineOperation({
  id: "stripe.PostCustomersCustomerFundingInstructions",
  method: "POST",
  path: "/v1/customers/{customer}/funding_instructions",
  inputSchema: PostCustomersCustomerFundingInstructionsInput,
  outputSchema: PostCustomersCustomerFundingInstructionsOutput,
  status: [200],
  contentType: "form",
  pathParams: ["customer"],
  bodyParams: ["bank_transfer", "currency", "expand", "funding_type"]
})

/**
 * Create or retrieve funding instructions for a customer cash balance
 */
export const postCustomersCustomerFundingInstructions = (input: PostCustomersCustomerFundingInstructionsInput) =>
  StripeClient.pipe(
    Effect.flatMap((client) => client.request(postCustomersCustomerFundingInstructionsOperation, input))
  )
