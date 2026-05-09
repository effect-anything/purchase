"use client"

import { createAuthClient } from "better-auth/react"

export const authClient: ReturnType<typeof createAuthClient> = createAuthClient({
  baseURL: typeof window !== "undefined" ? window.location.origin + "/api/auth" : "http://localhost:3000/api/auth"
})
