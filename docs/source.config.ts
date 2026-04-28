import type { StandardSchemaV1 } from "@standard-schema/spec"
import type { MetaData, PageData } from "fumadocs-core/source"

import { remarkMdxMermaid } from "fumadocs-core/mdx-plugins"
import { defineDocs, defineConfig, type DocsCollection } from "fumadocs-mdx/config"

export const docs: DocsCollection<
  StandardSchemaV1<unknown, PageData>,
  StandardSchemaV1<unknown, MetaData>
> = defineDocs({
  dir: "content/docs"
})

export default defineConfig({
  mdxOptions: {
    remarkPlugins: (plugins) => [remarkMdxMermaid, ...plugins]
  }
})
