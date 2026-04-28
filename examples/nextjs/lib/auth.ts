import type { D1Database } from "@cloudflare/workers-types"

import { kyselyAdapter } from "@better-auth/kysely-adapter"
import { betterAuth } from "better-auth"
import { nextCookies } from "better-auth/next-js"
import { env } from "cloudflare:workers"
import { Kysely } from "kysely"
import { D1Dialect } from "kysely-d1"

import { authDatabaseFieldMappings, authUserAdditionalFields } from "./auth-db-schema.ts"

const workerEnv = env as unknown as Record<string, unknown> & { DB?: D1Database }

const authSecret =
  typeof workerEnv.BETTER_AUTH_SECRET === "string" ? workerEnv.BETTER_AUTH_SECRET : "dev-secret-change-me"
const baseUrl = typeof workerEnv.BETTER_AUTH_URL === "string" ? workerEnv.BETTER_AUTH_URL : "http://localhost:3000"

const getDatabase = () => {
  if (!workerEnv.DB) {
    throw new Error('Missing Cloudflare D1 binding "DB" for auth runtime.')
  }

  return workerEnv.DB
}

const db = new Kysely({
  dialect: new D1Dialect({
    database: getDatabase()
  })
})

export const auth = betterAuth({
  secret: authSecret,
  baseURL: baseUrl,
  database: kyselyAdapter(db, {
    type: "sqlite",
    usePlural: false,
    transaction: false
  }),
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
  plugins: [nextCookies()]
})

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40) || "workspace"
