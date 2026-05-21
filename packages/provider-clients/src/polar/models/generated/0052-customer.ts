import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const Customer = Schema.Union(
  Schema.suspend(
    (): Schema.Schema<Models.CustomerIndividual, any, any> =>
      Models.CustomerIndividual as Schema.Schema<Models.CustomerIndividual, any, any>
  ),
  Schema.suspend(
    (): Schema.Schema<Models.CustomerTeam, any, any> =>
      Models.CustomerTeam as Schema.Schema<Models.CustomerTeam, any, any>
  )
)
export type Customer = typeof Customer.Type
