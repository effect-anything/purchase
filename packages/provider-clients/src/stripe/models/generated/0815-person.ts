import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const Person = Schema.Struct({
  account: Schema.optional(Schema.String),
  additional_tos_acceptances: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.PersonAdditionalTosAcceptances, any, any> =>
        Models.PersonAdditionalTosAcceptances as Schema.Schema<Models.PersonAdditionalTosAcceptances, any, any>
    )
  ),
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
  created: Schema.Number,
  dob: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.LegalEntityDob, any, any> =>
        Models.LegalEntityDob as Schema.Schema<Models.LegalEntityDob, any, any>
    )
  ),
  email: Schema.optional(Schema.NullOr(Schema.String)),
  first_name: Schema.optional(Schema.NullOr(Schema.String)),
  first_name_kana: Schema.optional(Schema.NullOr(Schema.String)),
  first_name_kanji: Schema.optional(Schema.NullOr(Schema.String)),
  full_name_aliases: Schema.optional(Schema.Array(Schema.String)),
  future_requirements: Schema.optional(
    Schema.NullOr(
      Schema.suspend(
        (): Schema.Schema<Models.PersonFutureRequirements, any, any> =>
          Models.PersonFutureRequirements as Schema.Schema<Models.PersonFutureRequirements, any, any>
      )
    )
  ),
  gender: Schema.optional(Schema.NullOr(Schema.String)),
  id: Schema.String,
  id_number_provided: Schema.optional(Schema.Boolean),
  id_number_secondary_provided: Schema.optional(Schema.Boolean),
  last_name: Schema.optional(Schema.NullOr(Schema.String)),
  last_name_kana: Schema.optional(Schema.NullOr(Schema.String)),
  last_name_kanji: Schema.optional(Schema.NullOr(Schema.String)),
  maiden_name: Schema.optional(Schema.NullOr(Schema.String)),
  metadata: Schema.optional(Schema.Record({ key: Schema.String, value: Schema.String })),
  nationality: Schema.optional(Schema.NullOr(Schema.String)),
  object: Schema.Literal("person"),
  phone: Schema.optional(Schema.NullOr(Schema.String)),
  political_exposure: Schema.optional(Schema.Literal("existing", "none")),
  registered_address: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.Address, any, any> => Models.Address as Schema.Schema<Models.Address, any, any>
    )
  ),
  relationship: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.PersonRelationship, any, any> =>
        Models.PersonRelationship as Schema.Schema<Models.PersonRelationship, any, any>
    )
  ),
  requirements: Schema.optional(
    Schema.NullOr(
      Schema.suspend(
        (): Schema.Schema<Models.PersonRequirements, any, any> =>
          Models.PersonRequirements as Schema.Schema<Models.PersonRequirements, any, any>
      )
    )
  ),
  ssn_last_4_provided: Schema.optional(Schema.Boolean),
  us_cfpb_data: Schema.optional(
    Schema.NullOr(
      Schema.suspend(
        (): Schema.Schema<Models.PersonUsCfpbData, any, any> =>
          Models.PersonUsCfpbData as Schema.Schema<Models.PersonUsCfpbData, any, any>
      )
    )
  ),
  verification: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.LegalEntityPersonVerification, any, any> =>
        Models.LegalEntityPersonVerification as Schema.Schema<Models.LegalEntityPersonVerification, any, any>
    )
  )
})
export type Person = typeof Person.Type
