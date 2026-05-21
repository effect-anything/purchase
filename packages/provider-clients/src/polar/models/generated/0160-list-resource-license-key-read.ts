import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const ListResourceLicenseKeyRead = Schema.Struct({
  items: Schema.Array(
    Schema.suspend(
      (): Schema.Schema<Models.LicenseKeyRead, any, any> =>
        Models.LicenseKeyRead as Schema.Schema<Models.LicenseKeyRead, any, any>
    )
  ),
  pagination: Schema.suspend(
    (): Schema.Schema<Models.Pagination, any, any> => Models.Pagination as Schema.Schema<Models.Pagination, any, any>
  )
})
export type ListResourceLicenseKeyRead = typeof ListResourceLicenseKeyRead.Type
