"use client"

import { renderMermaidSVG } from "beautiful-mermaid"
import { useMemo } from "react"

type MermaidProps = {
  chart: string
}

export function Mermaid({ chart }: MermaidProps) {
  const result = useMemo(() => {
    try {
      return {
        svg: renderMermaidSVG(chart.trim(), {
          bg: "var(--docs-color-surface-muted)",
          fg: "var(--docs-color-text-primary)",
          line: "color-mix(in srgb, var(--docs-color-text-primary) 54%, var(--docs-color-surface-muted))",
          accent: "var(--docs-color-surface-strong)",
          muted: "var(--docs-color-text-secondary)",
          surface: "var(--docs-color-surface-raised)",
          border: "var(--docs-color-border-strong)",
          font: "var(--docs-font-family-primary)",
          transparent: true,
          padding: 28,
          nodeSpacing: 34,
          layerSpacing: 48,
          componentSpacing: 36
        }),
        error: null
      }
    } catch (cause) {
      return {
        svg: null,
        error: cause instanceof Error ? cause.message : "Unable to render diagram"
      }
    }
  }, [chart])

  if (result.error) {
    return (
      <pre className="docs-mermaid docs-mermaid-error">
        <code>{result.error}</code>
        <code>{chart}</code>
      </pre>
    )
  }

  return (
    <figure className="docs-mermaid" aria-label="Diagram">
      <div dangerouslySetInnerHTML={{ __html: result.svg! }} />
    </figure>
  )
}
