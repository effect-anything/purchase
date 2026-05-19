import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const LicenseInstanceEntity = Schema.Struct({
  id: Schema.String,
  mode: Schema.suspend(() => Models.EnvironmentMode),
  object: Schema.String,
  name: Schema.String,
  status: Schema.Literal("active", "deactivated"),
  created_at: Schema.String,
})
export type LicenseInstanceEntity = typeof LicenseInstanceEntity.Type
