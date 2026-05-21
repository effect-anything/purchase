import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const LegalEntityCompany = Schema.Struct({
  address: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.Address, any, any> => Models.Address as Schema.Schema<Models.Address, any, any>
    )
  ),
  address_kana: Schema.optional(
    Schema.NullOr(
      Schema.suspend(
        (): Schema.Schema<Models.LegalEntityJapanAddress, any, any> =>
          Models.LegalEntityJapanAddress as Schema.Schema<Models.LegalEntityJapanAddress, any, any>
      )
    )
  ),
  address_kanji: Schema.optional(
    Schema.NullOr(
      Schema.suspend(
        (): Schema.Schema<Models.LegalEntityJapanAddress, any, any> =>
          Models.LegalEntityJapanAddress as Schema.Schema<Models.LegalEntityJapanAddress, any, any>
      )
    )
  ),
  directors_provided: Schema.optional(Schema.Boolean),
  directorship_declaration: Schema.optional(
    Schema.NullOr(
      Schema.suspend(
        (): Schema.Schema<Models.LegalEntityDirectorshipDeclaration, any, any> =>
          Models.LegalEntityDirectorshipDeclaration as Schema.Schema<
            Models.LegalEntityDirectorshipDeclaration,
            any,
            any
          >
      )
    )
  ),
  executives_provided: Schema.optional(Schema.Boolean),
  export_license_id: Schema.optional(Schema.String),
  export_purpose_code: Schema.optional(Schema.String),
  name: Schema.optional(Schema.NullOr(Schema.String)),
  name_kana: Schema.optional(Schema.NullOr(Schema.String)),
  name_kanji: Schema.optional(Schema.NullOr(Schema.String)),
  owners_provided: Schema.optional(Schema.Boolean),
  ownership_declaration: Schema.optional(
    Schema.NullOr(
      Schema.suspend(
        (): Schema.Schema<Models.LegalEntityUboDeclaration, any, any> =>
          Models.LegalEntityUboDeclaration as Schema.Schema<Models.LegalEntityUboDeclaration, any, any>
      )
    )
  ),
  ownership_exemption_reason: Schema.optional(
    Schema.Literal("qualified_entity_exceeds_ownership_threshold", "qualifies_as_financial_institution")
  ),
  phone: Schema.optional(Schema.NullOr(Schema.String)),
  registration_date: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.LegalEntityRegistrationDate, any, any> =>
        Models.LegalEntityRegistrationDate as Schema.Schema<Models.LegalEntityRegistrationDate, any, any>
    )
  ),
  representative_declaration: Schema.optional(
    Schema.NullOr(
      Schema.suspend(
        (): Schema.Schema<Models.LegalEntityRepresentativeDeclaration, any, any> =>
          Models.LegalEntityRepresentativeDeclaration as Schema.Schema<
            Models.LegalEntityRepresentativeDeclaration,
            any,
            any
          >
      )
    )
  ),
  structure: Schema.optional(
    Schema.Literal(
      "free_zone_establishment",
      "free_zone_llc",
      "government_instrumentality",
      "governmental_unit",
      "incorporated_non_profit",
      "incorporated_partnership",
      "limited_liability_partnership",
      "llc",
      "multi_member_llc",
      "private_company",
      "private_corporation",
      "private_partnership",
      "public_company",
      "public_corporation",
      "public_partnership",
      "registered_charity",
      "single_member_llc",
      "sole_establishment",
      "sole_proprietorship",
      "tax_exempt_government_instrumentality",
      "unincorporated_association",
      "unincorporated_non_profit",
      "unincorporated_partnership"
    )
  ),
  tax_id_provided: Schema.optional(Schema.Boolean),
  tax_id_registrar: Schema.optional(Schema.String),
  vat_id_provided: Schema.optional(Schema.Boolean),
  verification: Schema.optional(
    Schema.NullOr(
      Schema.suspend(
        (): Schema.Schema<Models.LegalEntityCompanyVerification, any, any> =>
          Models.LegalEntityCompanyVerification as Schema.Schema<Models.LegalEntityCompanyVerification, any, any>
      )
    )
  )
})
export type LegalEntityCompany = typeof LegalEntityCompany.Type
