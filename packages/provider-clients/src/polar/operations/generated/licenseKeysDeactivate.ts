import * as Effect from "effect/Effect"
import * as Schema from "effect/Schema"

import { defineOperation } from "../../../core/operation.ts"
import { PolarClient } from "../../client.ts"
import * as Models from "../../models.ts"

export const LicenseKeysDeactivateInput = Schema.Struct({
  key: Schema.String,
  organization_id: Schema.String,
  activation_id: Schema.String
})
export type LicenseKeysDeactivateInput = typeof LicenseKeysDeactivateInput.Type

export const LicenseKeysDeactivateOutput = Schema.Unknown
export type LicenseKeysDeactivateOutput = typeof LicenseKeysDeactivateOutput.Type

export const licenseKeysDeactivateOperation = defineOperation({
  id: "polar.license_keys:deactivate",
  method: "POST",
  path: "/v1/license-keys/deactivate",
  inputSchema: LicenseKeysDeactivateInput,
  outputSchema: LicenseKeysDeactivateOutput,
  status: [204],
  contentType: "json",
  bodyParams: ["key", "organization_id", "activation_id"]
})

/**
 * Deactivate License Key
 */
export const licenseKeysDeactivate = (input: LicenseKeysDeactivateInput) =>
  PolarClient.pipe(Effect.flatMap((client) => client.request(licenseKeysDeactivateOperation, input)))
