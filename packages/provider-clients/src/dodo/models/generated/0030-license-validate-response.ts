import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const LicenseValidateResponse = Schema.Struct({
  valid: Schema.Boolean
})
export type LicenseValidateResponse = typeof LicenseValidateResponse.Type
