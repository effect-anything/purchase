import * as Effect from "effect/Effect"
import * as Schema from "effect/Schema"

import { defineOperation } from "../../../core/operation.ts"
import * as Models from "../../models.ts"
import { PolarClient } from "../../client.ts"

export const LicenseKeysActivateInput = Schema.Struct({
  key: Schema.String,
  organization_id: Schema.String,
  label: Schema.String,
  conditions: Schema.optional(Schema.Record({ key: Schema.String, value: Schema.Union(Schema.String, Schema.Number, Schema.Number, Schema.Boolean) })),
  meta: Schema.optional(Schema.Record({ key: Schema.String, value: Schema.Union(Schema.String, Schema.Number, Schema.Number, Schema.Boolean) })),
})
export type LicenseKeysActivateInput = typeof LicenseKeysActivateInput.Type

export const LicenseKeysActivateOutput = Models.LicenseKeyActivationRead
export type LicenseKeysActivateOutput = typeof LicenseKeysActivateOutput.Type

export const licenseKeysActivateOperation = defineOperation({
  id: "polar.license_keys:activate",
  method: "POST",
  path: "/v1/license-keys/activate",
  inputSchema: LicenseKeysActivateInput,
  outputSchema: LicenseKeysActivateOutput,
  status: [200],
  contentType: "json",
  bodyParams: ["key", "organization_id", "label", "conditions", "meta"]
})

/**
 * Activate License Key
 */
export const licenseKeysActivate = (input: LicenseKeysActivateInput) =>
  PolarClient.pipe(Effect.flatMap((client) => client.request(licenseKeysActivateOperation, input)))
