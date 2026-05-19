import * as Effect from "effect/Effect"
import * as Schema from "effect/Schema"

import { defineOperation } from "../../../core/operation.ts"
import * as Models from "../../models.ts"
import { PolarClient } from "../../client.ts"

export const LicenseKeysGetInput = Schema.Struct({
  id: Schema.String,
})
export type LicenseKeysGetInput = typeof LicenseKeysGetInput.Type

export const LicenseKeysGetOutput = Models.LicenseKeyWithActivations
export type LicenseKeysGetOutput = typeof LicenseKeysGetOutput.Type

export const licenseKeysGetOperation = defineOperation({
  id: "polar.license_keys:get",
  method: "GET",
  path: "/v1/license-keys/{id}",
  inputSchema: LicenseKeysGetInput,
  outputSchema: LicenseKeysGetOutput,
  status: [200],
  contentType: "json",
  pathParams: ["id"]
})

/**
 * Get License Key
 */
export const licenseKeysGet = (input: LicenseKeysGetInput) =>
  PolarClient.pipe(Effect.flatMap((client) => client.request(licenseKeysGetOperation, input)))
