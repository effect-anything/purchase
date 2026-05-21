import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const CountryCode = Schema.suspend(
  (): Schema.Schema<Models.CountryCodeSupported, any, any> =>
    Models.CountryCodeSupported as Schema.Schema<Models.CountryCodeSupported, any, any>
)
export type CountryCode = typeof CountryCode.Type
