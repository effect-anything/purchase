import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const LicenseStatus = Schema.Literal("inactive", "active", "expired", "disabled")
export type LicenseStatus = typeof LicenseStatus.Type
