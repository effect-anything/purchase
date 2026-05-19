import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const LegalEntityRegistrationDate = Schema.Struct({
  day: Schema.NullOr(Schema.Number),
  month: Schema.NullOr(Schema.Number),
  year: Schema.NullOr(Schema.Number),
})
export type LegalEntityRegistrationDate = typeof LegalEntityRegistrationDate.Type
