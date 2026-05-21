import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const CustomerState = Schema.Union(
  Schema.suspend(
    (): Schema.Schema<Models.CustomerStateIndividual, any, any> =>
      Models.CustomerStateIndividual as Schema.Schema<Models.CustomerStateIndividual, any, any>
  ),
  Schema.suspend(
    (): Schema.Schema<Models.CustomerStateTeam, any, any> =>
      Models.CustomerStateTeam as Schema.Schema<Models.CustomerStateTeam, any, any>
  )
)
export type CustomerState = typeof CustomerState.Type
