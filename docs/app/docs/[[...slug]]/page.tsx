import type { Metadata } from "next"

import { source } from "@/lib/source"
import { useMDXComponents } from "@/mdx-components"
import { DocsBody, DocsDescription, DocsPage, DocsTitle } from "fumadocs-ui/page"
import { notFound } from "next/navigation"

type PageProps = {
  params: Promise<{ slug?: Array<string> }>
}

export function generateStaticParams() {
  return source.generateParams()
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug = [] } = await params
  const page = source.getPage(slug)

  if (!page) {
    return {}
  }

  return {
    title: page.data.title,
    description: page.data.description
  }
}

export default async function DocPage({ params }: PageProps) {
  const { slug = [] } = await params
  const page = source.getPage(slug)

  if (!page) {
    notFound()
  }

  const MDX = page.data.body

  return (
    <DocsPage
      breadcrumb={{ enabled: false }}
      footer={{ enabled: false }}
      toc={page.data.toc}
      tableOfContent={{ style: "clerk" }}
      tableOfContentPopover={{ enabled: false }}
    >
      <div className="grid gap-4 pt-4 mb-10 max-md:mb-8">
        <a
          className="inline-flex items-center font-docs-mono text-[13px] leading-none uppercase text-docs-text-secondary no-underline transition-colors hover:text-docs-text-primary active:text-docs-text-primary"
          href="/"
        >
          Purchase
        </a>
        <DocsTitle className="m-0 max-w-[16ch] text-[clamp(28px,4vw,40px)] leading-[1.08] tracking-[-0.04em] font-medium max-md:max-w-none">
          {page.data.title}
        </DocsTitle>
        <DocsDescription className="m-0 max-w-[54ch] text-[16px] leading-6 !text-docs-text-secondary">
          {page.data.description}
        </DocsDescription>
      </div>
      <DocsBody className="docs-prose">
        <MDX components={useMDXComponents({})} />
      </DocsBody>
    </DocsPage>
  )
}
