import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export type Filter = {
  readonly conjunction: Models.FilterConjunction
  readonly clauses: ReadonlyArray<Models.FilterClause | Models.Filter>
}

export const Filter = Schema.Struct({
  conjunction: Schema.suspend(
    (): Schema.Schema<Models.FilterConjunction, any, any> =>
      Models.FilterConjunction as Schema.Schema<Models.FilterConjunction, any, any>
  ),
  clauses: Schema.Array(
    Schema.Union(
      Schema.suspend(
        (): Schema.Schema<Models.FilterClause, any, any> =>
          Models.FilterClause as Schema.Schema<Models.FilterClause, any, any>
      ),
      Schema.suspend(
        (): Schema.Schema<Models.Filter, any, any> => Models.Filter as Schema.Schema<Models.Filter, any, any>
      )
    )
  )
})
