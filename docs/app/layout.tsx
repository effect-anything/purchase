import type { Metadata } from "next"
import type { ReactNode } from "react"

import { RootProvider } from "fumadocs-ui/provider/next"

// oxlint-disable-next-line import/no-unassigned-import
import "./global.css"

export const metadata: Metadata = {
  title: "Purchase Docs",
  description: "Documentation for the Purchase SDK."
}

export default function RootLayout(props: { readonly children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <RootProvider>{props.children}</RootProvider>
      </body>
    </html>
  )
}
