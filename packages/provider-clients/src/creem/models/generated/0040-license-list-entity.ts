import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const LicenseListEntity = Schema.Struct({
  items: Schema.Array(Schema.suspend((): Schema.Schema<Models.LicenseEntity> => Models.LicenseEntity)),
  pagination: Schema.suspend((): Schema.Schema<Models.PaginationEntity> => Models.PaginationEntity)
})
export type LicenseListEntity = typeof LicenseListEntity.Type
