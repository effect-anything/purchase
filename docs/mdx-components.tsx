import type { MDXComponents } from "mdx/types"

import { Mermaid } from "@/components/mermaid"
import defaultMdxComponents from "fumadocs-ui/mdx"

const fumadocsMdxComponents = defaultMdxComponents as unknown as MDXComponents

export function getMDXComponents(components: MDXComponents): MDXComponents {
  return {
    ...fumadocsMdxComponents,
    Mermaid,
    ...components
  }
}
