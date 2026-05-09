// oxlint-disable-next-line no-unused-vars
import type { Auth } from "better-auth/types"

import { SqlClient } from "@effect/sql"
import { betterAuth, type BetterAuthOptions } from "better-auth/minimal"
import { Config, Context, Effect, Layer, Redacted, Runtime } from "effect"

import { effectSqlAuthAdapter } from "../../internal/better-auth-effect-sql-adapter.ts"

const authDatabaseFieldMappings = {
  session: {
    fields: {
      expiresAt: "expires_at",
      createdAt: "created_at",
      updatedAt: "updated_at",
      ipAddress: "ip_address",
      userAgent: "user_agent",
      userId: "user_id"
    }
  },
  account: {
    fields: {
      accountId: "account_id",
      providerId: "provider_id",
      userId: "user_id",
      accessToken: "access_token",
      refreshToken: "refresh_token",
      idToken: "id_token",
      accessTokenExpiresAt: "access_token_expires_at",
      refreshTokenExpiresAt: "refresh_token_expires_at",
      createdAt: "created_at",
      updatedAt: "updated_at"
    }
  },
  verification: {
    fields: {
      expiresAt: "expires_at",
      createdAt: "created_at",
      updatedAt: "updated_at"
    }
  },
  user: {
    fields: {
      emailVerified: "email_verified",
      createdAt: "created_at",
      updatedAt: "updated_at"
    }
  }
} as const satisfies Pick<BetterAuthOptions, "account" | "session" | "user" | "verification">

export const authUserAdditionalFields = {
  workspaceSlug: {
    type: "string",
    fieldName: "workspace_slug",
    defaultValue: "starter-workspace",
    required: true,
    input: false
  },
  creditsUsed: {
    type: "number",
    fieldName: "credits_used",
    defaultValue: 0,
    required: true,
    input: false
  }
} as const satisfies NonNullable<BetterAuthOptions["user"]>["additionalFields"]

const BetterAuthSecret = Config.redacted("BETTER_AUTH_SECRET").pipe(
  Config.withDefault(Redacted.make("dev-secret-change-me"))
)

const BetterAuthURL = Config.url("BETTER_AUTH_URL").pipe(Config.withDefault(new URL("http://localhost:3000")))

const BasePublicURL = Config.url("BASE_PUBLIC_URL").pipe(Config.withDefault(new URL("http://localhost:3000")))

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40) || "workspace"

const make = Effect.gen(function* () {
  const runtime = yield* Effect.runtime<SqlClient.SqlClient>()
  const runPromise = Runtime.runPromise(runtime)
  const sql = yield* SqlClient.SqlClient

  const authSecret = yield* BetterAuthSecret
  const baseUrl = yield* BetterAuthURL
  const publicUrl = yield* BasePublicURL

  const auth = betterAuth({
    secret: Redacted.value(authSecret),
    baseURL: baseUrl.toString(),
    trustedOrigins: ["http://localhost:3000", "http://localhost:3001", baseUrl.origin, publicUrl.origin],
    database: effectSqlAuthAdapter(runPromise, sql),
    emailAndPassword: {
      enabled: true,
      requireEmailVerification: false,
      autoSignIn: true
    },
    session: authDatabaseFieldMappings.session,
    account: authDatabaseFieldMappings.account,
    verification: authDatabaseFieldMappings.verification,
    user: {
      ...authDatabaseFieldMappings.user,
      additionalFields: authUserAdditionalFields
    },
    databaseHooks: {
      user: {
        create: {
          before: async (user) => {
            const workspaceSlug = slugify(user.name || user.email.split("@")[0] || "workspace")
            return {
              data: {
                ...user,
                workspaceSlug,
                creditsUsed: 0
              }
            }
          }
        }
      }
    },
    plugins: []
  })

  return {
    auth,
    getSession: ({ headers }: { headers: Headers }) => Effect.promise(() => auth.api.getSession({ headers })),
    handler: (request: Request) => Effect.promise(() => auth.handler(request))
  } as const
})

export type AuthServiceShape = Effect.Effect.Success<typeof make>

export type BetterAuth = AuthServiceShape["auth"]

export type AuthSession = Effect.Effect.Success<ReturnType<AuthServiceShape["getSession"]>>

export class AuthService extends Context.Tag("AuthService")<AuthService, AuthServiceShape>() {
  static Default = Layer.effect(AuthService, make)
}
