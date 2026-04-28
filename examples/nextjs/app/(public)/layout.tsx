import type { ReactNode } from "react"

import { getSession } from "@/lib/auth-session"
import Link from "next/link"
import { redirect } from "next/navigation"

export default async function PublicLayout(props: { readonly children: ReactNode }) {
  const session = await getSession()

  if (session) {
    redirect("/workspace")
  }

  return (
    <>
      <header className="site-shell">
        <div className="site-nav">
          <Link href="/" className="brand-mark">
            <span className="brand-icon">N</span>
            <span>
              <span className="brand-kicker">Effect Purchase</span>
              <strong>Notes commerce app</strong>
            </span>
          </Link>
          <nav className="nav-links" aria-label="Public">
            <Link href="/pricing" className="nav-link">
              Pricing
            </Link>
          </nav>
          <div className="nav-actions">
            <Link href="/sign-in" className="nav-action-link">
              Sign in
            </Link>
            <Link href="/sign-up" className="primary-button nav-primary-button">
              Sign up
            </Link>
          </div>
        </div>
      </header>
      {props.children}
    </>
  )
}
