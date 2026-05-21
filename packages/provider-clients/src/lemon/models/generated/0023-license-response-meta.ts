import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const LicenseResponseMeta = Schema.Record({ key: Schema.String, value: Schema.Unknown })
export type LicenseResponseMeta = typeof LicenseResponseMeta.Type
