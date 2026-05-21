import * as Effect from "effect/Effect"
import * as Schema from "effect/Schema"

import { defineOperation } from "../../../core/operation.ts"
import { PolarClient } from "../../client.ts"
import * as Models from "../../models.ts"

export const BenefitsUpdateInput = Schema.Struct({
  id: Schema.String
})
export type BenefitsUpdateInput = typeof BenefitsUpdateInput.Type

export const BenefitsUpdateOutput = Models.Benefit
export type BenefitsUpdateOutput = typeof BenefitsUpdateOutput.Type

export const benefitsUpdateOperation = defineOperation({
  id: "polar.benefits:update",
  method: "PATCH",
  path: "/v1/benefits/{id}",
  inputSchema: BenefitsUpdateInput,
  outputSchema: BenefitsUpdateOutput,
  status: [200],
  contentType: "json",
  pathParams: ["id"]
})

/**
 * Update Benefit
 */
export const benefitsUpdate = (input: BenefitsUpdateInput) =>
  PolarClient.pipe(Effect.flatMap((client) => client.request(benefitsUpdateOperation, input)))
