import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const CustomerState = Schema.Union(Schema.suspend((): typeof Models.CustomerStateIndividual => Models.CustomerStateIndividual), Schema.suspend((): typeof Models.CustomerStateTeam => Models.CustomerStateTeam))
export type CustomerState = typeof CustomerState.Type
