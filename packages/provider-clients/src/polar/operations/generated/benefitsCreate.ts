import * as Effect from "effect/Effect"
import * as Schema from "effect/Schema"

import { defineOperation } from "../../../core/operation.ts"
import * as Models from "../../models.ts"
import { PolarClient } from "../../client.ts"

export const BenefitsCreateInput = Schema.Struct({

})
export type BenefitsCreateInput = typeof BenefitsCreateInput.Type

export const BenefitsCreateOutput = Models.Benefit
export type BenefitsCreateOutput = typeof BenefitsCreateOutput.Type

export const benefitsCreateOperation = defineOperation({
  id: "polar.benefits:create",
  method: "POST",
  path: "/v1/benefits/",
  inputSchema: BenefitsCreateInput,
  outputSchema: BenefitsCreateOutput,
  status: [201],
  contentType: "json"
})

/**
 * Create Benefit
 */
export const benefitsCreate = (input: BenefitsCreateInput) =>
  PolarClient.pipe(Effect.flatMap((client) => client.request(benefitsCreateOperation, input)))
