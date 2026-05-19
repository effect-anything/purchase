import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const ProductMediaFileRead = Schema.Struct({
  id: Schema.String,
  organization_id: Schema.String,
  name: Schema.String,
  path: Schema.String,
  mime_type: Schema.String,
  size: Schema.Number,
  storage_version: Schema.NullOr(Schema.String),
  checksum_etag: Schema.NullOr(Schema.String),
  checksum_sha256_base64: Schema.NullOr(Schema.String),
  checksum_sha256_hex: Schema.NullOr(Schema.String),
  last_modified_at: Schema.NullOr(Schema.String),
  version: Schema.NullOr(Schema.String),
  service: Schema.String,
  is_uploaded: Schema.Boolean,
  created_at: Schema.String,
  size_readable: Schema.String,
  public_url: Schema.String,
})
export type ProductMediaFileRead = typeof ProductMediaFileRead.Type
