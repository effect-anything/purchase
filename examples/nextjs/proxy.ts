import type { NextRequest } from "next/server"

import { getSessionCookie } from "better-auth/cookies"
import { NextResponse } from "next/server"

const signInPath = "/sign-in"

export function proxy(request: NextRequest) {
  const sessionToken = getSessionCookie(request)

  if (sessionToken) {
    return NextResponse.next()
  }

  const signInUrl = new URL(signInPath, request.url)
  signInUrl.searchParams.set("redirectTo", request.nextUrl.pathname)

  return NextResponse.redirect(signInUrl)
}

export const config = {
  matcher: ["/account/:path*", "/workspace/:path*"]
}
