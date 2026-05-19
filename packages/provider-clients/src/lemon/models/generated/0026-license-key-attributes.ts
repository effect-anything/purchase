import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const LicenseKeyAttributes = Schema.Record({ key: Schema.String, value: Schema.Unknown })
export type LicenseKeyAttributes = typeof LicenseKeyAttributes.Type
