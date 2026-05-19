import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const Customer = Schema.Union(Schema.suspend((): typeof Models.CustomerIndividual => Models.CustomerIndividual), Schema.suspend((): typeof Models.CustomerTeam => Models.CustomerTeam))
export type Customer = typeof Customer.Type
