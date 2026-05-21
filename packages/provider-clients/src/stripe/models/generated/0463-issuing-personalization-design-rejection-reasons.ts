import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const IssuingPersonalizationDesignRejectionReasons = Schema.Struct({
  card_logo: Schema.NullOr(
    Schema.Array(
      Schema.Literal(
        "geographic_location",
        "inappropriate",
        "network_name",
        "non_binary_image",
        "non_fiat_currency",
        "other",
        "other_entity",
        "promotional_material"
      )
    )
  ),
  carrier_text: Schema.NullOr(
    Schema.Array(
      Schema.Literal(
        "geographic_location",
        "inappropriate",
        "network_name",
        "non_fiat_currency",
        "other",
        "other_entity",
        "promotional_material"
      )
    )
  )
})
export type IssuingPersonalizationDesignRejectionReasons = typeof IssuingPersonalizationDesignRejectionReasons.Type
