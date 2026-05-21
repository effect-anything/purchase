import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export type File = {
  readonly created: number
  readonly expires_at: number | null
  readonly filename: string | null
  readonly id: string
  readonly links?: {
    readonly data: ReadonlyArray<Models.FileLink>
    readonly has_more: boolean
    readonly object: "list"
    readonly url: string
  } | null
  readonly object: "file"
  readonly purpose:
    | "account_requirement"
    | "additional_verification"
    | "business_icon"
    | "business_logo"
    | "customer_signature"
    | "dispute_evidence"
    | "document_provider_identity_document"
    | "finance_report_run"
    | "financial_account_statement"
    | "identity_document"
    | "identity_document_downloadable"
    | "issuing_regulatory_reporting"
    | "pci_document"
    | "platform_terms_of_service"
    | "selfie"
    | "sigma_scheduled_query"
    | "tax_document_user_upload"
    | "terminal_android_apk"
    | "terminal_reader_splashscreen"
    | "terminal_wifi_certificate"
    | "terminal_wifi_private_key"
  readonly size: number
  readonly title: string | null
  readonly type: string | null
  readonly url: string | null
}

export const File = Schema.Struct({
  created: Schema.Number,
  expires_at: Schema.NullOr(Schema.Number),
  filename: Schema.NullOr(Schema.String),
  id: Schema.String,
  links: Schema.optional(
    Schema.NullOr(
      Schema.Struct({
        data: Schema.Array(
          Schema.suspend(
            (): Schema.Schema<Models.FileLink, any, any> => Models.FileLink as Schema.Schema<Models.FileLink, any, any>
          )
        ),
        has_more: Schema.Boolean,
        object: Schema.Literal("list"),
        url: Schema.String
      })
    )
  ),
  object: Schema.Literal("file"),
  purpose: Schema.Literal(
    "account_requirement",
    "additional_verification",
    "business_icon",
    "business_logo",
    "customer_signature",
    "dispute_evidence",
    "document_provider_identity_document",
    "finance_report_run",
    "financial_account_statement",
    "identity_document",
    "identity_document_downloadable",
    "issuing_regulatory_reporting",
    "pci_document",
    "platform_terms_of_service",
    "selfie",
    "sigma_scheduled_query",
    "tax_document_user_upload",
    "terminal_android_apk",
    "terminal_reader_splashscreen",
    "terminal_wifi_certificate",
    "terminal_wifi_private_key"
  ),
  size: Schema.Number,
  title: Schema.NullOr(Schema.String),
  type: Schema.NullOr(Schema.String),
  url: Schema.NullOr(Schema.String)
})
