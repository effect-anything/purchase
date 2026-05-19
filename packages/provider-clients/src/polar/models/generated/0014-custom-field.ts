import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const CustomField = Schema.Union(Schema.suspend((): typeof Models.CustomFieldText => Models.CustomFieldText), Schema.suspend((): typeof Models.CustomFieldNumber => Models.CustomFieldNumber), Schema.suspend((): typeof Models.CustomFieldDate => Models.CustomFieldDate), Schema.suspend((): typeof Models.CustomFieldCheckbox => Models.CustomFieldCheckbox), Schema.suspend((): typeof Models.CustomFieldSelect => Models.CustomFieldSelect))
export type CustomField = typeof CustomField.Type
