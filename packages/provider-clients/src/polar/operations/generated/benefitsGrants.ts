import * as Effect from "effect/Effect"
import * as Schema from "effect/Schema"

import { defineOperation } from "../../../core/operation.ts"
import { PolarClient } from "../../client.ts"
import * as Models from "../../models.ts"

export const BenefitsGrantsInput = Schema.Struct({
  id: Schema.String,
  is_granted: Schema.optional(Schema.NullOr(Schema.Boolean)),
  customer_id: Schema.optional(Schema.NullOr(Schema.Union(Schema.String, Schema.Array(Schema.String)))),
  member_id: Schema.optional(Schema.NullOr(Schema.Union(Schema.String, Schema.Array(Schema.String)))),
  page: Schema.optional(Schema.Number),
  limit: Schema.optional(Schema.Number)
})
export type BenefitsGrantsInput = typeof BenefitsGrantsInput.Type

export const BenefitsGrantsOutput = Models.ListResourceBenefitGrant
export type BenefitsGrantsOutput = typeof BenefitsGrantsOutput.Type

export const benefitsGrantsOperation = defineOperation({
  id: "polar.benefits:grants",
  method: "GET",
  path: "/v1/benefits/{id}/grants",
  inputSchema: BenefitsGrantsInput,
  outputSchema: BenefitsGrantsOutput,
  status: [200],
  contentType: "json",
  pathParams: ["id"],
  queryParams: ["is_granted", "customer_id", "member_id", "page", "limit"]
})

/**
 * List Benefit Grants
 */
export const benefitsGrants = (input: BenefitsGrantsInput) =>
  PolarClient.pipe(Effect.flatMap((client) => client.request(benefitsGrantsOperation, input)))
