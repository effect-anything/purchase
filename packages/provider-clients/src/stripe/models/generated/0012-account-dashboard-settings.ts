import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const AccountDashboardSettings = Schema.Struct({
  display_name: Schema.NullOr(Schema.String),
  timezone: Schema.NullOr(Schema.String)
})
export type AccountDashboardSettings = typeof AccountDashboardSettings.Type
