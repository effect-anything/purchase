import * as Effect from "effect/Effect"
import * as Schema from "effect/Schema"

import { defineOperation } from "../../../core/operation.ts"
import { CreemClient } from "../../client.ts"
import * as Models from "../../models.ts"

export const GenerateCustomerLinksInput = Schema.Struct({
  customer_id: Schema.String
})
export type GenerateCustomerLinksInput = typeof GenerateCustomerLinksInput.Type

export const GenerateCustomerLinksOutput = Models.CustomerLinksEntity
export type GenerateCustomerLinksOutput = typeof GenerateCustomerLinksOutput.Type

export const generateCustomerLinksOperation = defineOperation({
  id: "creem.generateCustomerLinks",
  method: "POST",
  path: "/customers/billing",
  inputSchema: GenerateCustomerLinksInput,
  outputSchema: GenerateCustomerLinksOutput,
  status: [200],
  contentType: "json",
  bodyParams: ["customer_id"]
})

/**
 * Generate Customer Links
 */
export const generateCustomerLinks = (input: GenerateCustomerLinksInput) =>
  CreemClient.pipe(Effect.flatMap((client) => client.request(generateCustomerLinksOperation, input)))
