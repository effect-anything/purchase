import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const PersonRelationship = Schema.Struct({
  authorizer: Schema.NullOr(Schema.Boolean),
  director: Schema.NullOr(Schema.Boolean),
  executive: Schema.NullOr(Schema.Boolean),
  legal_guardian: Schema.NullOr(Schema.Boolean),
  owner: Schema.NullOr(Schema.Boolean),
  percent_ownership: Schema.NullOr(Schema.Number),
  representative: Schema.NullOr(Schema.Boolean),
  title: Schema.NullOr(Schema.String),
})
export type PersonRelationship = typeof PersonRelationship.Type
