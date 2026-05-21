import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const CountryCode = Schema.suspend((): Schema.Schema<Models.CountryCodeSupported> => Models.CountryCodeSupported)
export type CountryCode = typeof CountryCode.Type
