import type { BaseLayoutProps } from "fumadocs-ui/layouts/shared"

/**
 * Shared layout configurations.
 *
 * You can configure the navigation, links, etc. here.
 */
export const baseOptions: BaseLayoutProps = {
  nav: {
    title: (
      <>
        <strong className="font-docs-mono text-[13px] leading-none font-medium uppercase">Purchase</strong>
        <span className="font-docs-mono text-[12px] leading-none uppercase text-docs-text-secondary">
          Documentation
        </span>
      </>
    )
  },
  links: []
}
