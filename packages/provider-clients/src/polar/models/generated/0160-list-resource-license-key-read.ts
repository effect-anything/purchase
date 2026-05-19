import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const ListResourceLicenseKeyRead = Schema.Struct({
  items: Schema.Array(Schema.suspend((): typeof Models.LicenseKeyRead => Models.LicenseKeyRead)),
  pagination: Schema.suspend((): typeof Models.Pagination => Models.Pagination),
})
export type ListResourceLicenseKeyRead = typeof ListResourceLicenseKeyRead.Type
