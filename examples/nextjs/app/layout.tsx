import type { Metadata } from "next"
import type { ReactNode } from "react"

// oxlint-disable-next-line import/no-unassigned-import
import "./styles.css"

export const metadata: Metadata = {
  title: "Purchase SDK Next.js app",
  description: "A realistic Next.js app for the Purchase SDK with catalog, checkout, webhooks, and account state."
}

export default function RootLayout(props: { readonly children: ReactNode }) {
  return (
    <html lang="en">
      <body>{props.children}</body>
    </html>
  )
}
