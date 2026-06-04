import type { CommercialCatalogSyncPlan, CommercialCatalogSyncResult } from "../catalog/sync.ts"
import type { PaymentEnvironmentTag } from "../provider.ts"

import { databaseLabel, type DatabaseTarget } from "./db.ts"

const countPlanChanges = (plan: CommercialCatalogSyncPlan) =>
  plan.productsToCreate.length +
  plan.pricesToCreate.length +
  plan.localRowsToInsert.length +
  plan.localRowsToUpdate.length +
  plan.providerRefsToInsert.length +
  plan.providerRefsToUpdate.length +
  plan.staleRows.length +
  plan.archiveCandidates.length

const appendRows = (lines: Array<string>, title: string, rows: ReadonlyArray<string>) => {
  if (rows.length === 0) {
    return
  }

  lines.push("", title)
  for (const row of rows) {
    lines.push(`  ${row}`)
  }
}

export const formatCatalogSyncResult = <
  TOptions extends { readonly environment: PaymentEnvironmentTag; readonly database: DatabaseTarget }
>(
  options: TOptions,
  result: CommercialCatalogSyncResult
) => {
  const lines = [
    "Connected",
    `  Database · ${databaseLabel(options.database)}`,
    `  Provider · ${result.provider} (${options.environment})`,
    `  Mode     · ${result.dryRun ? "dry-run" : "apply"}`,
    "",
    "Schema",
    "  Up to date"
  ]

  const plan = result.plan
  const changes = countPlanChanges(plan)
  lines.push("", "Plan changes")
  if (changes === 0) {
    lines.push("  No changes")
  } else {
    appendRows(
      lines,
      "  Products to create",
      plan.productsToCreate.map((entry) => `+ ${entry.productId} -> ${entry.providerProductId} (${entry.ownership})`)
    )
    appendRows(
      lines,
      "  Prices to create",
      plan.pricesToCreate.map(
        (entry) => `+ ${entry.offerId} -> ${entry.providerOfferId} (${entry.reason}, ${entry.ownership})`
      )
    )
    appendRows(lines, "  Local rows", [
      ...plan.localRowsToInsert.map((entry) => `+ ${entry.offerId} (${entry.reason})`),
      ...plan.localRowsToUpdate.map((entry) => `~ ${entry.offerId} (${entry.reason})`)
    ])
    appendRows(lines, "  Provider refs", [
      ...plan.providerRefsToInsert.map((entry) => `+ ${entry.ownerType}:${entry.ownerId} -> ${entry.providerId}`),
      ...plan.providerRefsToUpdate.map((entry) => `~ ${entry.ownerType}:${entry.ownerId} -> ${entry.providerId}`)
    ])
    appendRows(
      lines,
      "  Stale rows",
      plan.staleRows.map((entry) => `- ${entry.offerId} (${entry.reason})`)
    )
    appendRows(
      lines,
      "  Archive candidates",
      plan.archiveCandidates.map(
        (entry) =>
          `${entry.safeToArchive ? "~" : "!"} ${entry.ownerType}:${entry.ownerId} -> ${entry.providerId} (${entry.action})`
      )
    )
  }

  lines.push("", `Done · ${result.offers} offers ${result.dryRun ? "planned" : "synced"}`)
  return lines.join("\n")
}
