import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const IssuingPersonalizationDesignPreferences = Schema.Struct({
  is_default: Schema.Boolean,
  is_platform_default: Schema.NullOr(Schema.Boolean),
})
export type IssuingPersonalizationDesignPreferences = typeof IssuingPersonalizationDesignPreferences.Type
