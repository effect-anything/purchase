"use client"

import { authClient } from "@/services/auth/auth-client"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState, useTransition } from "react"

export function AuthForm(props: { readonly mode: "sign-in" | "sign-up" }) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const submit = (formData: FormData) => {
    const email = String(formData.get("email") ?? "")
    const password = String(formData.get("password") ?? "")
    const name = String(formData.get("name") ?? "")

    setError(null)

    startTransition(async () => {
      const result =
        props.mode === "sign-up"
          ? await authClient.signUp.email({
              email,
              password,
              name,
              callbackURL: "/workspace"
            })
          : await authClient.signIn.email({
              email,
              password,
              callbackURL: "/workspace"
            })

      if (result.error) {
        setError(result.error.message ?? "Authentication failed.")
        return
      }

      router.push("/workspace")
      router.refresh()
    })
  }

  return (
    <form
      className="auth-form"
      action={(formData) => {
        submit(formData)
      }}
    >
      {props.mode === "sign-up" ? <input name="name" placeholder="Workspace owner name" required /> : null}
      <input name="email" type="email" placeholder="Email" required />
      <input name="password" type="password" placeholder="Password" required />
      {error ? <p className="inline-message">{error}</p> : null}
      <button type="submit" className="primary-button" disabled={pending}>
        {props.mode === "sign-up" ? "Create account" : "Sign in"}
      </button>
      <p className="muted-copy">
        {props.mode === "sign-up" ? "Already have an account?" : "Need an account?"}{" "}
        <Link href={props.mode === "sign-up" ? "/sign-in" : "/sign-up"} className="text-link" prefetch={false}>
          {props.mode === "sign-up" ? "Sign in" : "Sign up"}
        </Link>
      </p>
    </form>
  )
}
