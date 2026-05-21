import * as Effect from "effect/Effect"
import * as Schema from "effect/Schema"

import { defineOperation } from "../../../core/operation.ts"
import { PolarClient } from "../../client.ts"
import * as Models from "../../models.ts"

export const BenefitsListInput = Schema.Struct({
  organization_id: Schema.optional(Schema.NullOr(Schema.Union(Schema.String, Schema.Array(Schema.String)))),
  type: Schema.optional(Schema.NullOr(Schema.Union(Models.BenefitType, Schema.Array(Models.BenefitType)))),
  id: Schema.optional(Schema.NullOr(Schema.Union(Schema.String, Schema.Array(Schema.String)))),
  exclude_id: Schema.optional(Schema.NullOr(Schema.Union(Schema.String, Schema.Array(Schema.String)))),
  query: Schema.optional(Schema.NullOr(Schema.String)),
  page: Schema.optional(Schema.Number),
  limit: Schema.optional(Schema.Number),
  sorting: Schema.optional(Schema.NullOr(Schema.Array(Models.BenefitSortProperty))),
  metadata: Schema.optional(Models.MetadataQuery)
})
export type BenefitsListInput = typeof BenefitsListInput.Type

export const BenefitsListOutput = Models.ListResourceBenefit
export type BenefitsListOutput = typeof BenefitsListOutput.Type

export const benefitsListOperation = defineOperation({
  id: "polar.benefits:list",
  method: "GET",
  path: "/v1/benefits/",
  inputSchema: BenefitsListInput,
  outputSchema: BenefitsListOutput,
  status: [200],
  contentType: "json",
  queryParams: ["organization_id", "type", "id", "exclude_id", "query", "page", "limit", "sorting", "metadata"]
})

/**
 * List Benefits
 */
export const benefitsList = (input: BenefitsListInput) =>
  PolarClient.pipe(Effect.flatMap((client) => client.request(benefitsListOperation, input)))
