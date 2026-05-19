import * as Effect from "effect/Effect"
import * as Schema from "effect/Schema"

import { defineOperation } from "../../../core/operation.ts"
import * as Models from "../../models.ts"
import { PolarClient } from "../../client.ts"

export const BenefitsDeleteInput = Schema.Struct({
  id: Schema.String,
})
export type BenefitsDeleteInput = typeof BenefitsDeleteInput.Type

export const BenefitsDeleteOutput = Schema.Unknown
export type BenefitsDeleteOutput = typeof BenefitsDeleteOutput.Type

export const benefitsDeleteOperation = defineOperation({
  id: "polar.benefits:delete",
  method: "DELETE",
  path: "/v1/benefits/{id}",
  inputSchema: BenefitsDeleteInput,
  outputSchema: BenefitsDeleteOutput,
  status: [204],
  contentType: "json",
  pathParams: ["id"]
})

/**
 * Delete Benefit
 */
export const benefitsDelete = (input: BenefitsDeleteInput) =>
  PolarClient.pipe(Effect.flatMap((client) => client.request(benefitsDeleteOperation, input)))
