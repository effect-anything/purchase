import * as Effect from "effect/Effect"
import * as Schema from "effect/Schema"

import { defineOperation } from "../../../core/operation.ts"
import * as Models from "../../models.ts"
import { PolarClient } from "../../client.ts"

export const LicenseKeysGetActivationInput = Schema.Struct({
  id: Schema.String,
  activation_id: Schema.String,
})
export type LicenseKeysGetActivationInput = typeof LicenseKeysGetActivationInput.Type

export const LicenseKeysGetActivationOutput = Models.LicenseKeyActivationRead
export type LicenseKeysGetActivationOutput = typeof LicenseKeysGetActivationOutput.Type

export const licenseKeysGetActivationOperation = defineOperation({
  id: "polar.license_keys:get_activation",
  method: "GET",
  path: "/v1/license-keys/{id}/activations/{activation_id}",
  inputSchema: LicenseKeysGetActivationInput,
  outputSchema: LicenseKeysGetActivationOutput,
  status: [200],
  contentType: "json",
  pathParams: ["id", "activation_id"]
})

/**
 * Get Activation
 */
export const licenseKeysGetActivation = (input: LicenseKeysGetActivationInput) =>
  PolarClient.pipe(Effect.flatMap((client) => client.request(licenseKeysGetActivationOperation, input)))
