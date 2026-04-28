"use client"

import { authClient } from "@/lib/auth-client"
import { useRouter } from "next/navigation"
import { useTransition } from "react"

export function SignOutButton() {
  const router = useRouter()
  const [pending, startTransition] = useTransition()

  return (
    <button
      type="button"
      className="nav-sign-out-button"
      disabled={pending}
      onClick={() => {
        startTransition(async () => {
          await authClient.signOut()
          router.push("/")
          router.refresh()
        })
      }}
    >
      Sign out
    </button>
  )
}
