import type { BetterAuthOptions } from "better-auth"

export const authDatabaseFieldMappings = {
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
