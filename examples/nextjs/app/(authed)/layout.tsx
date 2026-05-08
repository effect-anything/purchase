import type { ReactNode } from "react"

import { NavAccount } from "@/components/nav-account"
import { SignOutButton } from "@/components/sign-out-button"
import { getSessionOrThrow } from "@/services/auth"
import Link from "next/link"

export default async function AuthedLayout(props: { readonly children: ReactNode }) {
  const session = await getSessionOrThrow()

  return (
    <>
      <header className="site-shell">
        <div className="site-nav">
          <Link href="/workspace" className="brand-mark">
            <span className="brand-icon">W</span>
            <span>
              <span className="brand-kicker">Workspace</span>
              <strong>{session.user.workspaceSlug}</strong>
            </span>
          </Link>
          <nav className="nav-links" aria-label="App">
            <Link href="/workspace" className="nav-link">
              Workspace
            </Link>
            <Link href="/account" className="nav-link">
              Account
            </Link>
          </nav>
          <NavAccount action={<SignOutButton />} context={session.user.workspaceSlug} email={session.user.email} />
        </div>
      </header>
      {props.children}
    </>
  )
}
