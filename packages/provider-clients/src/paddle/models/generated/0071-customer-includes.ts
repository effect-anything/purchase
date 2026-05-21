import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const CustomerIncludes = Schema.Struct({
  id: Schema.suspend((): Schema.Schema<Models.CustomerId> => Models.CustomerId),
  name: Schema.NullOr(Schema.suspend((): Schema.Schema<Models.Name> => Models.Name)),
  email: Schema.suspend((): Schema.Schema<Models.Email> => Models.Email),
  marketing_consent: Schema.Boolean,
  status: Schema.suspend((): Schema.Schema<Models.Status> => Models.Status),
  custom_data: Schema.NullOr(Schema.suspend((): Schema.Schema<Models.CustomData> => Models.CustomData)),
  locale: Schema.String,
  created_at: Schema.suspend((): Schema.Schema<Models.CreatedAt> => Models.CreatedAt),
  updated_at: Schema.suspend((): Schema.Schema<Models.UpdatedAt> => Models.UpdatedAt),
  import_meta: Schema.NullOr(Schema.suspend((): Schema.Schema<Models.ImportMeta> => Models.ImportMeta))
})
export type CustomerIncludes = typeof CustomerIncludes.Type
