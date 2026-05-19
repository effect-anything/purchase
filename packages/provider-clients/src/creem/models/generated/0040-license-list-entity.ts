import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const LicenseListEntity = Schema.Struct({
  items: Schema.Array(Schema.suspend(() => Models.LicenseEntity)),
  pagination: Schema.suspend(() => Models.PaginationEntity),
})
export type LicenseListEntity = typeof LicenseListEntity.Type
