import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const LicenseKeyStatus = Schema.Literal("active", "expired", "disabled")
export type LicenseKeyStatus = typeof LicenseKeyStatus.Type
