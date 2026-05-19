import * as Effect from "effect/Effect"
import * as Schema from "effect/Schema"

import { defineOperation } from "../../../core/operation.ts"
import * as Models from "../../models.ts"
import { PolarClient } from "../../client.ts"

export const LicenseKeysValidateInput = Schema.Struct({
  key: Schema.String,
  organization_id: Schema.String,
  activation_id: Schema.optional(Schema.NullOr(Schema.String)),
  benefit_id: Schema.optional(Schema.NullOr(Schema.String)),
  customer_id: Schema.optional(Schema.NullOr(Schema.String)),
  increment_usage: Schema.optional(Schema.NullOr(Schema.Number)),
  conditions: Schema.optional(Schema.Record({ key: Schema.String, value: Schema.Union(Schema.String, Schema.Number, Schema.Number, Schema.Boolean) })),
})
export type LicenseKeysValidateInput = typeof LicenseKeysValidateInput.Type

export const LicenseKeysValidateOutput = Models.ValidatedLicenseKey
export type LicenseKeysValidateOutput = typeof LicenseKeysValidateOutput.Type

export const licenseKeysValidateOperation = defineOperation({
  id: "polar.license_keys:validate",
  method: "POST",
  path: "/v1/license-keys/validate",
  inputSchema: LicenseKeysValidateInput,
  outputSchema: LicenseKeysValidateOutput,
  status: [200],
  contentType: "json",
  bodyParams: ["key", "organization_id", "activation_id", "benefit_id", "customer_id", "increment_usage", "conditions"]
})

/**
 * Validate License Key
 */
export const licenseKeysValidate = (input: LicenseKeysValidateInput) =>
  PolarClient.pipe(Effect.flatMap((client) => client.request(licenseKeysValidateOperation, input)))
