import type { ReactNode } from "react"

import { source } from "@/lib/source"
import { DocsLayout } from "fumadocs-ui/layouts/docs"

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <DocsLayout
      tree={source.pageTree}
      nav={{
        transparentMode: "always",
        title: (
          <span className="docs-nav-brand">
            <strong>Purchase</strong>
            <span>Documentation</span>
          </span>
        )
      }}
      searchToggle={{
        enabled: false
      }}
      sidebar={{
        banner: <div className="docs-sidebar-rule" aria-hidden="true" />,
        collapsible: false,
        defaultOpenLevel: 1
      }}
      themeSwitch={{
        enabled: false
      }}
    >
      {children}
    </DocsLayout>
  )
}
