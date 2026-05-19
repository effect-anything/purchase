import type { ReactNode } from "react"

type ApiRow = {
  name: ReactNode
  description: ReactNode
  key?: string
}

type ApiTableProps = {
  rows: Array<ApiRow>
  nameLabel?: string
  descriptionLabel?: string
}

export function ApiTable({ rows, nameLabel = "API", descriptionLabel = "Description" }: ApiTableProps) {
  return (
    <div className="docs-api" role="table" aria-label={nameLabel}>
      <div className="docs-api-header" role="row">
        <div role="columnheader">{nameLabel}</div>
        <div role="columnheader">{descriptionLabel}</div>
      </div>
      {rows.map((row, i) => (
        <div key={row.key ?? i} className="docs-api-row" role="row">
          <div className="docs-api-name" role="cell">
            {typeof row.name === "string" ? <code>{row.name}</code> : row.name}
          </div>
          <div className="docs-api-desc" role="cell">
            {row.description}
          </div>
        </div>
      ))}
    </div>
  )
}
