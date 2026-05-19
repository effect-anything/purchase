import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const LegalEntityCompany = Schema.Struct({
  address: Schema.optional(Schema.suspend((): typeof Models.Address => Models.Address)),
  address_kana: Schema.optional(Schema.NullOr(Schema.suspend((): typeof Models.LegalEntityJapanAddress => Models.LegalEntityJapanAddress))),
  address_kanji: Schema.optional(Schema.NullOr(Schema.suspend((): typeof Models.LegalEntityJapanAddress => Models.LegalEntityJapanAddress))),
  directors_provided: Schema.optional(Schema.Boolean),
  directorship_declaration: Schema.optional(Schema.NullOr(Schema.suspend((): typeof Models.LegalEntityDirectorshipDeclaration => Models.LegalEntityDirectorshipDeclaration))),
  executives_provided: Schema.optional(Schema.Boolean),
  export_license_id: Schema.optional(Schema.String),
  export_purpose_code: Schema.optional(Schema.String),
  name: Schema.optional(Schema.NullOr(Schema.String)),
  name_kana: Schema.optional(Schema.NullOr(Schema.String)),
  name_kanji: Schema.optional(Schema.NullOr(Schema.String)),
  owners_provided: Schema.optional(Schema.Boolean),
  ownership_declaration: Schema.optional(Schema.NullOr(Schema.suspend((): typeof Models.LegalEntityUboDeclaration => Models.LegalEntityUboDeclaration))),
  ownership_exemption_reason: Schema.optional(Schema.Literal("qualified_entity_exceeds_ownership_threshold", "qualifies_as_financial_institution")),
  phone: Schema.optional(Schema.NullOr(Schema.String)),
  registration_date: Schema.optional(Schema.suspend((): typeof Models.LegalEntityRegistrationDate => Models.LegalEntityRegistrationDate)),
  representative_declaration: Schema.optional(Schema.NullOr(Schema.suspend((): typeof Models.LegalEntityRepresentativeDeclaration => Models.LegalEntityRepresentativeDeclaration))),
  structure: Schema.optional(Schema.Literal("free_zone_establishment", "free_zone_llc", "government_instrumentality", "governmental_unit", "incorporated_non_profit", "incorporated_partnership", "limited_liability_partnership", "llc", "multi_member_llc", "private_company", "private_corporation", "private_partnership", "public_company", "public_corporation", "public_partnership", "registered_charity", "single_member_llc", "sole_establishment", "sole_proprietorship", "tax_exempt_government_instrumentality", "unincorporated_association", "unincorporated_non_profit", "unincorporated_partnership")),
  tax_id_provided: Schema.optional(Schema.Boolean),
  tax_id_registrar: Schema.optional(Schema.String),
  vat_id_provided: Schema.optional(Schema.Boolean),
  verification: Schema.optional(Schema.NullOr(Schema.suspend((): typeof Models.LegalEntityCompanyVerification => Models.LegalEntityCompanyVerification))),
})
export type LegalEntityCompany = typeof LegalEntityCompany.Type
