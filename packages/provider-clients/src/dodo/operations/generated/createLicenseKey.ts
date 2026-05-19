import * as Effect from "effect/Effect"
import * as Schema from "effect/Schema"

import { defineOperation } from "../../../core/operation.ts"
import * as Models from "../../models.ts"
import { DodoClient } from "../../client.ts"

export const CreateLicenseKeyInput = Schema.Struct({
  customer_id: Schema.String,
  key: Schema.String,
  product_id: Schema.String,
  activations_limit: Schema.optional(Schema.NullOr(Schema.Number)),
  expires_at: Schema.optional(Schema.NullOr(Schema.String)),
})
export type CreateLicenseKeyInput = typeof CreateLicenseKeyInput.Type

export const CreateLicenseKeyOutput = Models.LicenseKey
export type CreateLicenseKeyOutput = typeof CreateLicenseKeyOutput.Type

export const createLicenseKeyOperation = defineOperation({
  id: "dodo.createLicenseKey",
  method: "POST",
  path: "/license_keys",
  inputSchema: CreateLicenseKeyInput,
  outputSchema: CreateLicenseKeyOutput,
  status: [200],
  contentType: "json",
  bodyParams: ["customer_id", "key", "product_id", "activations_limit", "expires_at"]
})

/**
 * Create license key
 */
export const createLicenseKey = (input: CreateLicenseKeyInput) =>
  DodoClient.pipe(Effect.flatMap((client) => client.request(createLicenseKeyOperation, input)))
