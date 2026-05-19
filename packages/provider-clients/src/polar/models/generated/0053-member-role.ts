import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const MemberRole = Schema.Literal("owner", "billing_manager", "member")
export type MemberRole = typeof MemberRole.Type
