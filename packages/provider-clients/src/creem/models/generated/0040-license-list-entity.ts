import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const LicenseListEntity = Schema.Struct({
  items: Schema.Array(
    Schema.suspend(
      (): Schema.Schema<Models.LicenseEntity, any, any> =>
        Models.LicenseEntity as Schema.Schema<Models.LicenseEntity, any, any>
    )
  ),
  pagination: Schema.suspend(
    (): Schema.Schema<Models.PaginationEntity, any, any> =>
      Models.PaginationEntity as Schema.Schema<Models.PaginationEntity, any, any>
  )
})
export type LicenseListEntity = typeof LicenseListEntity.Type
