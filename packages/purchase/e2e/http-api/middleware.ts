import { HttpApiMiddleware } from "@effect/platform"

import { AuthenticationRequired, CurrentUser } from "./domain.ts"

export class CurrentUserMiddleware extends HttpApiMiddleware.Tag<CurrentUserMiddleware>()("CurrentUserMiddleware", {
  provides: CurrentUser,
  failure: AuthenticationRequired
}) {}
