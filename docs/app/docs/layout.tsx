import type { ReactNode } from "react"

import { baseOptions } from "@/lib/layout.shared"
import { source } from "@/lib/source"
import { DocsLayout } from "fumadocs-ui/layouts/notebook"

export default function Layout(props: { readonly children: ReactNode }) {
  return (
    <DocsLayout tree={source.pageTree} {...baseOptions}>
      {props.children}
    </DocsLayout>
  )
}
