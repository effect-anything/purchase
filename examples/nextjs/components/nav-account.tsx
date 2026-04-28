import type { ReactNode } from "react"

export function NavAccount(props: { readonly email: string; readonly context: string; readonly action?: ReactNode }) {
  return (
    <div className="nav-account" aria-label="Current account">
      <div className="nav-account-identity">
        <strong>{props.email}</strong>
      </div>
      {props.action ? <div className="nav-account-action">{props.action}</div> : null}
    </div>
  )
}
