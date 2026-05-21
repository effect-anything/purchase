import * as Effect from "effect/Effect"
import * as Schema from "effect/Schema"

import { defineOperation } from "../../../core/operation.ts"
import { PolarClient } from "../../client.ts"
import * as Models from "../../models.ts"

export const BenefitsGetInput = Schema.Struct({
  id: Schema.String
})
export type BenefitsGetInput = typeof BenefitsGetInput.Type

export const BenefitsGetOutput = Models.Benefit
export type BenefitsGetOutput = typeof BenefitsGetOutput.Type

export const benefitsGetOperation = defineOperation({
  id: "polar.benefits:get",
  method: "GET",
  path: "/v1/benefits/{id}",
  inputSchema: BenefitsGetInput,
  outputSchema: BenefitsGetOutput,
  status: [200],
  contentType: "json",
  pathParams: ["id"]
})

/**
 * Get Benefit
 */
export const benefitsGet = (input: BenefitsGetInput) =>
  PolarClient.pipe(Effect.flatMap((client) => client.request(benefitsGetOperation, input)))
