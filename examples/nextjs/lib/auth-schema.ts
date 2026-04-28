export type AppUserRecord = {
  readonly id: string
  readonly email: string
  readonly name: string
  readonly image: string | null
  readonly emailVerified: number
  readonly workspaceSlug: string
  readonly creditsUsed: number
  readonly createdAt: string
  readonly updatedAt: string
}

export type AppSessionRecord = {
  readonly id: string
  readonly userId: string
  readonly token: string
  readonly expiresAt: string
  readonly ipAddress: string | null
  readonly userAgent: string | null
  readonly createdAt: string
  readonly updatedAt: string
}

export type AppAccountRecord = {
  readonly id: string
  readonly accountId: string
  readonly providerId: string
  readonly userId: string
  readonly accessToken: string | null
  readonly refreshToken: string | null
  readonly idToken: string | null
  readonly accessTokenExpiresAt: string | null
  readonly refreshTokenExpiresAt: string | null
  readonly scope: string | null
  readonly password: string | null
  readonly createdAt: string
  readonly updatedAt: string
}

export type AppVerificationRecord = {
  readonly id: string
  readonly identifier: string
  readonly value: string
  readonly expiresAt: string
  readonly createdAt: string | null
  readonly updatedAt: string | null
}
