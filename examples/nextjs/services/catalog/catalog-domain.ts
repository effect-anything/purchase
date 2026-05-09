import { CommercialCatalog } from "@effect-x/purchase/schema"
import { Schema } from "effect"

export const CatalogApiResponseSchema = Schema.Struct({
  environment: Schema.String,
  provider: Schema.String,
  catalog: CommercialCatalog
})
