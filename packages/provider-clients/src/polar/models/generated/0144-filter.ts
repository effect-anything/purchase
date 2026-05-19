import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const Filter = Schema.Struct({
  conjunction: Schema.suspend((): typeof Models.FilterConjunction => Models.FilterConjunction),
  clauses: Schema.Array(Schema.Union(Schema.suspend((): typeof Models.FilterClause => Models.FilterClause), Schema.suspend((): typeof Models.Filter => Models.Filter))),
})
export type Filter = typeof Filter.Type
