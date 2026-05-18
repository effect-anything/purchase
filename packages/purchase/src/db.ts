import type * as Model from "@effect/sql/Model"
import type * as Schema from "effect/Schema"

import { ColumnConfigTypeId } from "@effect-x/db/schema"
import * as SqlClient from "@effect/sql/SqlClient"
import * as Context from "effect/Context"
import * as Effect from "effect/Effect"
import * as Layer from "effect/Layer"
import * as Option from "effect/Option"

import * as DB from "./tables.ts"

export type PurchaseStorageModel<TKey extends string> = {
  readonly model: PurchaseDbModel
  readonly fieldKeys: Record<TKey, string>
  readonly modelName: string
  readonly fields: Record<TKey, string>
}

type PurchaseDbModel = Model.AnyNoContext & {
  readonly table: string
  readonly fields: Schema.Struct.Fields
}

type PurchaseDbModelFieldKey<TModel extends PurchaseDbModel> = Extract<keyof Schema.Schema.Type<TModel>, string>

export type PurchaseStorageModelBinding<
  TModel extends PurchaseDbModel,
  TFields extends Record<string, PurchaseDbModelFieldKey<TModel>>
> = {
  readonly model: TModel
  readonly fields: TFields
}

export type PurchaseStorageRecordFromBinding<
  TBinding extends PurchaseStorageModelBinding<PurchaseDbModel, Record<string, string>>
> = {
  readonly [K in keyof TBinding["fields"]]: Schema.Schema.Type<TBinding["model"]>[TBinding["fields"][K]]
}

export type PurchaseStorageRecordFromModel<TModel extends PurchaseStorageModel<string>> = {
  readonly [K in keyof TModel["fieldKeys"]]: Schema.Schema.Type<TModel["model"]>[TModel["fieldKeys"][K]]
}
const camelToSnake = (value: string) => value.replace(/([a-z0-9])([A-Z])/g, "$1_$2").toLowerCase()

const getModelFieldSchema = (field: unknown) => {
  const value = field as {
    readonly ast?: { readonly _tag?: string }
    readonly from?: { readonly ast?: { readonly _tag?: string } }
  }

  return value.from?.ast ? value.from : value
}

const getModelColumnName = (fieldName: string, field: unknown) => {
  const schema = getModelFieldSchema(field) as {
    readonly ast?: {
      readonly annotations?: Record<PropertyKey, unknown>
    }
  }
  const annotations = schema.ast?.annotations ?? {}
  const columnConfig = annotations[ColumnConfigTypeId] as
    | {
        readonly map?: string | undefined
      }
    | undefined

  return columnConfig?.map ?? camelToSnake(fieldName)
}

export const definePurchaseStorageModel = <
  TModel extends PurchaseDbModel,
  const TFields extends Record<string, PurchaseDbModelFieldKey<TModel>>
>(
  binding: PurchaseStorageModelBinding<TModel, TFields>
): {
  readonly model: TModel
  readonly fieldKeys: TFields
  readonly modelName: TModel["table"]
  readonly fields: {
    readonly [K in keyof TFields]: string
  }
} => ({
  model: binding.model,
  fieldKeys: binding.fields,
  modelName: binding.model.table,
  fields: Object.fromEntries(
    Object.entries(binding.fields).map(([alias, fieldKey]) => [
      alias,
      getModelColumnName(fieldKey, binding.model.fields[fieldKey])
    ])
  ) as {
    readonly [K in keyof TFields]: string
  }
})

export const defaultPurchaseStorageModels = {
  customer: definePurchaseStorageModel({
    model: DB.Customer,
    fields: {
      id: "id",
      email: "email",
      name: "name",
      metadata: "metadata",
      provider: "provider",
      createdAt: "createdAt",
      updatedAt: "updatedAt"
    }
  }),
  feature: definePurchaseStorageModel({
    model: DB.Feature,
    fields: {
      id: "id",
      type: "type",
      createdAt: "createdAt",
      updatedAt: "updatedAt"
    }
  }),
  checkoutIntent: definePurchaseStorageModel({
    model: DB.CheckoutIntent,
    fields: {
      id: "id",
      customerId: "customerId",
      offerId: "offerId",
      provider: "provider",
      providerCheckoutSessionId: "providerCheckoutSessionId",
      checkoutUrl: "checkoutUrl",
      status: "status",
      metadata: "metadata",
      createdAt: "createdAt",
      updatedAt: "updatedAt"
    }
  }),
  commercialEvent: definePurchaseStorageModel({
    model: DB.CommercialEvent,
    fields: {
      id: "id",
      provider: "provider",
      providerEventId: "providerEventId",
      kind: "kind",
      customerId: "customerId",
      offerId: "offerId",
      agreementId: "agreementId",
      payload: "payload",
      occurredAt: "occurredAt",
      createdAt: "createdAt"
    }
  }),
  creditLedger: definePurchaseStorageModel({
    model: DB.CreditLedger,
    fields: {
      id: "id",
      customerId: "customerId",
      productId: "productId",
      offerId: "offerId",
      amount: "amount",
      direction: "direction",
      idempotencyKey: "idempotencyKey",
      sourceEventId: "sourceEventId",
      reason: "reason",
      createdAt: "createdAt"
    }
  }),
  product: definePurchaseStorageModel({
    model: DB.Product,
    fields: {
      internalId: "internalId",
      id: "id",
      version: "version",
      name: "name",
      group: "group",
      isDefault: "isDefault",
      priceAmount: "priceAmount",
      priceInterval: "priceInterval",
      hash: "hash",
      provider: "provider",
      createdAt: "createdAt",
      updatedAt: "updatedAt"
    }
  }),
  providerRef: definePurchaseStorageModel({
    model: DB.ProviderRef,
    fields: {
      id: "id",
      provider: "provider",
      ownerType: "ownerType",
      ownerId: "ownerId",
      providerId: "providerId",
      kind: "kind",
      createdAt: "createdAt",
      updatedAt: "updatedAt"
    }
  }),
  subscription: definePurchaseStorageModel({
    model: DB.Subscription,
    fields: {
      id: "id",
      customerId: "customerId",
      productInternalId: "productInternalId",
      providerId: "providerId",
      providerData: "providerData",
      status: "status",
      canceled: "canceled",
      cancelAtPeriodEnd: "cancelAtPeriodEnd",
      startedAt: "startedAt",
      trialEndsAt: "trialEndsAt",
      currentPeriodStartAt: "currentPeriodStartAt",
      currentPeriodEndAt: "currentPeriodEndAt",
      canceledAt: "canceledAt",
      endedAt: "endedAt",
      scheduledProductId: "scheduledProductId",
      quantity: "quantity",
      createdAt: "createdAt",
      updatedAt: "updatedAt"
    }
  }),
  entitlement: definePurchaseStorageModel({
    model: DB.Entitlement,
    fields: {
      id: "id",
      subscriptionId: "subscriptionId",
      customerId: "customerId",
      featureId: "featureId",
      limit: "limit",
      balance: "balance",
      nextResetAt: "nextResetAt",
      createdAt: "createdAt",
      updatedAt: "updatedAt"
    }
  }),
  invoice: definePurchaseStorageModel({
    model: DB.Invoice,
    fields: {
      id: "id",
      customerId: "customerId",
      subscriptionId: "subscriptionId",
      type: "type",
      status: "status",
      amount: "amount",
      currency: "currency",
      description: "description",
      hostedUrl: "hostedUrl",
      providerId: "providerId",
      providerData: "providerData",
      periodStartAt: "periodStartAt",
      periodEndAt: "periodEndAt",
      createdAt: "createdAt",
      updatedAt: "updatedAt"
    }
  }),
  metadata: definePurchaseStorageModel({
    model: DB.Metadata,
    fields: {
      id: "id",
      providerId: "providerId",
      type: "type",
      data: "data",
      providerCheckoutSessionId: "providerCheckoutSessionId",
      expiresAt: "expiresAt",
      createdAt: "createdAt"
    }
  }),
  webhookEvent: definePurchaseStorageModel({
    model: DB.WebhookEvent,
    fields: {
      id: "id",
      providerId: "providerId",
      providerEventId: "providerEventId",
      type: "type",
      payload: "payload",
      status: "status",
      error: "error",
      traceId: "traceId",
      receivedAt: "receivedAt",
      processedAt: "processedAt"
    }
  })
} as const

export type PartialPurchaseStorageModel<TModel extends PurchaseStorageModel<string>> = {
  readonly modelName?: string | undefined
  readonly fields?: Partial<TModel["fields"]> | undefined
}

export interface PurchaseStorageOverrides {
  readonly checkoutIntent?: PartialPurchaseStorageModel<PurchaseCheckoutIntentModel> | undefined
  readonly commercialEvent?: PartialPurchaseStorageModel<PurchaseCommercialEventModel> | undefined
  readonly creditLedger?: PartialPurchaseStorageModel<PurchaseCreditLedgerModel> | undefined
  readonly customer?: PartialPurchaseStorageModel<PurchaseCustomerModel> | undefined
  readonly feature?: PartialPurchaseStorageModel<PurchaseFeatureModel> | undefined
  readonly product?: PartialPurchaseStorageModel<PurchaseProductModel> | undefined
  readonly providerRef?: PartialPurchaseStorageModel<PurchaseProviderRefModel> | undefined
  readonly subscription?: PartialPurchaseStorageModel<PurchaseSubscriptionModel> | undefined
  readonly entitlement?: PartialPurchaseStorageModel<PurchaseEntitlementModel> | undefined
  readonly invoice?: PartialPurchaseStorageModel<PurchaseInvoiceModel> | undefined
  readonly metadata?: PartialPurchaseStorageModel<PurchaseMetadataModel> | undefined
  readonly webhookEvent?: PartialPurchaseStorageModel<PurchaseWebhookEventModel> | undefined
}

export type PurchaseStorageCustomerRecord = PurchaseStorageRecordFromBinding<{
  readonly model: typeof DB.Customer
  readonly fields: typeof defaultPurchaseStorageModels.customer.fieldKeys
}>

export type PurchaseStorageCheckoutIntentRecord = PurchaseStorageRecordFromBinding<{
  readonly model: typeof DB.CheckoutIntent
  readonly fields: typeof defaultPurchaseStorageModels.checkoutIntent.fieldKeys
}>

export type PurchaseStorageCommercialEventRecord = PurchaseStorageRecordFromBinding<{
  readonly model: typeof DB.CommercialEvent
  readonly fields: typeof defaultPurchaseStorageModels.commercialEvent.fieldKeys
}>

export type PurchaseStorageCreditLedgerRecord = PurchaseStorageRecordFromBinding<{
  readonly model: typeof DB.CreditLedger
  readonly fields: typeof defaultPurchaseStorageModels.creditLedger.fieldKeys
}>

export type PurchaseStorageSubscriptionRecord = PurchaseStorageRecordFromBinding<{
  readonly model: typeof DB.Subscription
  readonly fields: typeof defaultPurchaseStorageModels.subscription.fieldKeys
}>

export type PurchaseStorageProductRecord = PurchaseStorageRecordFromBinding<{
  readonly model: typeof DB.Product
  readonly fields: typeof defaultPurchaseStorageModels.product.fieldKeys
}>

export type PurchaseStorageProviderRefRecord = PurchaseStorageRecordFromBinding<{
  readonly model: typeof DB.ProviderRef
  readonly fields: typeof defaultPurchaseStorageModels.providerRef.fieldKeys
}>

export type PurchaseStorageFeatureRecord = PurchaseStorageRecordFromBinding<{
  readonly model: typeof DB.Feature
  readonly fields: typeof defaultPurchaseStorageModels.feature.fieldKeys
}>

export type PurchaseStorageEntitlementRecord = PurchaseStorageRecordFromBinding<{
  readonly model: typeof DB.Entitlement
  readonly fields: typeof defaultPurchaseStorageModels.entitlement.fieldKeys
}>

export type PurchaseStorageInvoiceRecord = PurchaseStorageRecordFromBinding<{
  readonly model: typeof DB.Invoice
  readonly fields: typeof defaultPurchaseStorageModels.invoice.fieldKeys
}>

export type PurchaseStorageMetadataRecord = PurchaseStorageRecordFromBinding<{
  readonly model: typeof DB.Metadata
  readonly fields: typeof defaultPurchaseStorageModels.metadata.fieldKeys
}>

export type PurchaseStorageWebhookEventRecord = PurchaseStorageRecordFromBinding<{
  readonly model: typeof DB.WebhookEvent
  readonly fields: typeof defaultPurchaseStorageModels.webhookEvent.fieldKeys
}>

export type PurchaseStorageWhere<TModel extends PurchaseStorageModel<string>> = ReadonlyArray<
  readonly [keyof TModel["fields"], unknown]
>

export type PurchaseStorageOrderBy<TModel extends PurchaseStorageModel<string>> = readonly [
  keyof TModel["fields"],
  "asc" | "desc"
]

export interface PurchaseStorageFindFirstInput<TModel extends PurchaseStorageModel<string>> {
  readonly where?: PurchaseStorageWhere<TModel> | undefined
  readonly orderBy?: PurchaseStorageOrderBy<TModel> | undefined
}

export interface PurchaseStorageFindManyInput<TModel extends PurchaseStorageModel<string>> {
  readonly where?: PurchaseStorageWhere<TModel> | undefined
  readonly orderBy?: PurchaseStorageOrderBy<TModel> | undefined
  readonly limit?: number | undefined
}

export type PurchaseStorageValues<TModel extends PurchaseStorageModel<string>> = Partial<
  PurchaseStorageRecordFromModel<TModel>
>

export interface PurchaseStorageInsertInput<TModel extends PurchaseStorageModel<string>> {
  readonly values: PurchaseStorageValues<TModel>
}

export interface PurchaseStorageUpdateFirstInput<TModel extends PurchaseStorageModel<string>> {
  readonly where: PurchaseStorageWhere<TModel>
  readonly set: PurchaseStorageValues<TModel>
  readonly orderBy?: PurchaseStorageOrderBy<TModel> | undefined
}

export interface PurchaseStorageDeleteManyInput<TModel extends PurchaseStorageModel<string>> {
  readonly where?: PurchaseStorageWhere<TModel> | undefined
}

export interface PurchaseStorageRepo<TModel extends PurchaseStorageModel<string>> {
  readonly findFirst: (
    input: PurchaseStorageFindFirstInput<TModel>
  ) => Effect.Effect<Option.Option<PurchaseStorageRecordFromModel<TModel>>, unknown>
  readonly findMany: (
    input: PurchaseStorageFindManyInput<TModel>
  ) => Effect.Effect<ReadonlyArray<PurchaseStorageRecordFromModel<TModel>>, unknown>
  readonly insert: (
    input: PurchaseStorageInsertInput<TModel>
  ) => Effect.Effect<PurchaseStorageRecordFromModel<TModel>, unknown>
  readonly updateFirst: (
    input: PurchaseStorageUpdateFirstInput<TModel>
  ) => Effect.Effect<Option.Option<PurchaseStorageRecordFromModel<TModel>>, unknown>
  readonly deleteMany: (input: PurchaseStorageDeleteManyInput<TModel>) => Effect.Effect<void, unknown>
}

const mergeStorageModel = <TModel extends PurchaseStorageModel<string>>(
  model: TModel,
  override: PartialPurchaseStorageModel<TModel> | undefined
): TModel =>
  ({
    ...model,
    modelName: override?.modelName ?? model.modelName,
    fields: {
      ...model.fields,
      ...override?.fields
    }
  }) as TModel

const quoteIdentifier = (value: string) =>
  value
    .split(".")
    .map((part) => `"${part.replaceAll('"', '""')}"`)
    .join(".")

const selectColumns = <TFields extends Record<string, string>>(fields: TFields) =>
  Object.entries(fields)
    .map(([alias, field]) => `${quoteIdentifier(field)} AS ${quoteIdentifier(alias)}`)
    .join(", ")

const runUnsafeAll = <A>(sql: SqlClient.SqlClient, statement: string, params: ReadonlyArray<unknown>) =>
  sql.unsafe(statement, [...params]).withoutTransform.pipe(Effect.map((rows) => rows as ReadonlyArray<A>))

const runUnsafeOne = <A>(sql: SqlClient.SqlClient, statement: string, params: ReadonlyArray<unknown>) =>
  runUnsafeAll<A>(sql, statement, params).pipe(Effect.map((rows) => Option.fromNullable(rows[0])))

const getModelColumn = <TModel extends PurchaseStorageModel<string>>(model: TModel, field: keyof TModel["fields"]) =>
  (model.fields as Record<keyof TModel["fields"], string>)[field]

const encodeStorageValue = (value: unknown): unknown => {
  if (value === undefined) {
    return null
  }

  if (value instanceof Date) {
    return value.toISOString()
  }

  if (typeof value === "boolean") {
    return value ? 1 : 0
  }

  if (value && typeof value === "object") {
    return JSON.stringify(value)
  }

  return value
}

const buildWhereClause = <TModel extends PurchaseStorageModel<string>>(
  model: TModel,
  where: PurchaseStorageWhere<TModel> | undefined
) => {
  if (!where || where.length === 0) {
    return {
      params: [] as ReadonlyArray<unknown>,
      sql: ""
    }
  }

  return {
    params: where.map(([, value]) => value),
    sql: ` WHERE ${where.map(([field]) => `${quoteIdentifier(getModelColumn(model, field))} = ?`).join(" AND ")}`
  }
}

const buildOrderClause = <TModel extends PurchaseStorageModel<string>>(
  model: TModel,
  orderBy: PurchaseStorageOrderBy<TModel> | undefined
) => {
  if (!orderBy) {
    return ""
  }

  return ` ORDER BY ${quoteIdentifier(getModelColumn(model, orderBy[0]))} ${orderBy[1].toUpperCase()}`
}

const buildInsertClause = <TModel extends PurchaseStorageModel<string>>(
  model: TModel,
  values: PurchaseStorageValues<TModel>
) => {
  const entries = Object.entries(values).filter(([, value]) => value !== undefined) as ReadonlyArray<
    readonly [keyof TModel["fields"], unknown]
  >

  return {
    columns: entries.map(([field]) => quoteIdentifier(getModelColumn(model, field))).join(", "),
    params: entries.map(([, value]) => encodeStorageValue(value)),
    placeholders: entries.map(() => "?").join(", ")
  }
}

const buildSetClause = <TModel extends PurchaseStorageModel<string>>(
  model: TModel,
  values: PurchaseStorageValues<TModel>
) => {
  const entries = Object.entries(values).filter(([, value]) => value !== undefined) as ReadonlyArray<
    readonly [keyof TModel["fields"], unknown]
  >

  return {
    params: entries.map(([, value]) => encodeStorageValue(value)),
    sql: entries.map(([field]) => `${quoteIdentifier(getModelColumn(model, field))} = ?`).join(", ")
  }
}

export type PurchaseCheckoutIntentModel = typeof defaultPurchaseStorageModels.checkoutIntent
export type PurchaseCommercialEventModel = typeof defaultPurchaseStorageModels.commercialEvent
export type PurchaseCreditLedgerModel = typeof defaultPurchaseStorageModels.creditLedger
export type PurchaseCustomerModel = typeof defaultPurchaseStorageModels.customer
export type PurchaseFeatureModel = typeof defaultPurchaseStorageModels.feature
export type PurchaseSubscriptionModel = typeof defaultPurchaseStorageModels.subscription
export type PurchaseEntitlementModel = typeof defaultPurchaseStorageModels.entitlement
export type PurchaseInvoiceModel = typeof defaultPurchaseStorageModels.invoice
export type PurchaseMetadataModel = typeof defaultPurchaseStorageModels.metadata
export type PurchaseWebhookEventModel = typeof defaultPurchaseStorageModels.webhookEvent
export type PurchaseProductModel = typeof defaultPurchaseStorageModels.product
export type PurchaseProviderRefModel = typeof defaultPurchaseStorageModels.providerRef

export class PurchaseStorageAdapter extends Context.Tag("@xstack/pay/PurchaseStorageAdapter")<
  PurchaseStorageAdapter,
  {
    readonly checkoutIntent: PurchaseStorageRepo<PurchaseCheckoutIntentModel>
    readonly commercialEvent: PurchaseStorageRepo<PurchaseCommercialEventModel>
    readonly creditLedger: PurchaseStorageRepo<PurchaseCreditLedgerModel>
    readonly customer: PurchaseStorageRepo<PurchaseCustomerModel>
    readonly feature: PurchaseStorageRepo<PurchaseFeatureModel>
    readonly product: PurchaseStorageRepo<PurchaseProductModel>
    readonly subscription: PurchaseStorageRepo<PurchaseSubscriptionModel>
    readonly entitlement: PurchaseStorageRepo<PurchaseEntitlementModel>
    readonly invoice: PurchaseStorageRepo<PurchaseInvoiceModel>
    readonly metadata: PurchaseStorageRepo<PurchaseMetadataModel>
    readonly providerRef: PurchaseStorageRepo<PurchaseProviderRefModel>
    readonly webhookEvent: PurchaseStorageRepo<PurchaseWebhookEventModel>
  }
>() {
  static make = (overrides?: PurchaseStorageOverrides | undefined) =>
    Layer.effect(
      PurchaseStorageAdapter,
      Effect.gen(function* () {
        const sql = yield* SqlClient.SqlClient

        const makePurchaseStorageRepo = <TModel extends PurchaseStorageModel<string>>(input: {
          readonly model: TModel
        }): PurchaseStorageRepo<TModel> => {
          const findFirst: PurchaseStorageRepo<TModel>["findFirst"] = ({ where, orderBy }) => {
            const select = selectColumns(input.model.fields)
            const whereClause = buildWhereClause(input.model, where)
            const orderClause = buildOrderClause(input.model, orderBy)

            return runUnsafeOne(
              sql,
              `SELECT ${select} FROM ${quoteIdentifier(input.model.modelName)}${whereClause.sql}${orderClause} LIMIT 1`,
              whereClause.params
            )
          }

          const findMany: PurchaseStorageRepo<TModel>["findMany"] = ({ where, orderBy, limit }) => {
            const select = selectColumns(input.model.fields)
            const whereClause = buildWhereClause(input.model, where)
            const orderClause = buildOrderClause(input.model, orderBy)
            const limitClause = limit === undefined ? "" : ` LIMIT ${limit}`

            return runUnsafeAll(
              sql,
              `SELECT ${select} FROM ${quoteIdentifier(input.model.modelName)}${whereClause.sql}${orderClause}${limitClause}`,
              whereClause.params
            )
          }

          const insert: PurchaseStorageRepo<TModel>["insert"] = ({ values }) => {
            const select = selectColumns(input.model.fields)
            const insertClause = buildInsertClause(input.model, values)

            return runUnsafeOne<PurchaseStorageRecordFromModel<TModel>>(
              sql,
              `INSERT INTO ${quoteIdentifier(input.model.modelName)} (${insertClause.columns}) VALUES (${insertClause.placeholders}) RETURNING ${select}`,
              insertClause.params
            ).pipe(Effect.map(Option.getOrThrow))
          }

          const updateFirst: PurchaseStorageRepo<TModel>["updateFirst"] = ({ where, set, orderBy }) => {
            const select = selectColumns(input.model.fields)
            const setClause = buildSetClause(input.model, set)
            const whereClause = buildWhereClause(input.model, where)
            const orderClause = buildOrderClause(input.model, orderBy)

            if (setClause.sql.length === 0) {
              return findFirst({ where, orderBy })
            }

            return runUnsafeOne(
              sql,
              `UPDATE ${quoteIdentifier(input.model.modelName)} SET ${setClause.sql}${whereClause.sql}${orderClause} RETURNING ${select}`,
              [...setClause.params, ...whereClause.params]
            )
          }

          const deleteMany: PurchaseStorageRepo<TModel>["deleteMany"] = ({ where }) => {
            const whereClause = buildWhereClause(input.model, where)
            return sql
              .unsafe(`DELETE FROM ${quoteIdentifier(input.model.modelName)}${whereClause.sql}`, [
                ...whereClause.params
              ])
              .withoutTransform.pipe(Effect.asVoid)
          }

          return {
            findFirst,
            findMany,
            insert,
            updateFirst,
            deleteMany
          }
        }

        const checkoutIntent = makePurchaseStorageRepo({
          model: mergeStorageModel(defaultPurchaseStorageModels.checkoutIntent, overrides?.checkoutIntent)
        })
        const commercialEvent = makePurchaseStorageRepo({
          model: mergeStorageModel(defaultPurchaseStorageModels.commercialEvent, overrides?.commercialEvent)
        })
        const creditLedger = makePurchaseStorageRepo({
          model: mergeStorageModel(defaultPurchaseStorageModels.creditLedger, overrides?.creditLedger)
        })
        const customer = makePurchaseStorageRepo({
          model: mergeStorageModel(defaultPurchaseStorageModels.customer, overrides?.customer)
        })
        const feature = makePurchaseStorageRepo({
          model: mergeStorageModel(defaultPurchaseStorageModels.feature, overrides?.feature)
        })
        const product = makePurchaseStorageRepo({
          model: mergeStorageModel(defaultPurchaseStorageModels.product, overrides?.product)
        })
        const providerRef = makePurchaseStorageRepo({
          model: mergeStorageModel(defaultPurchaseStorageModels.providerRef, overrides?.providerRef)
        })
        const subscription = makePurchaseStorageRepo({
          model: mergeStorageModel(defaultPurchaseStorageModels.subscription, overrides?.subscription)
        })
        const entitlement = makePurchaseStorageRepo({
          model: mergeStorageModel(defaultPurchaseStorageModels.entitlement, overrides?.entitlement)
        })
        const invoice = makePurchaseStorageRepo({
          model: mergeStorageModel(defaultPurchaseStorageModels.invoice, overrides?.invoice)
        })
        const metadata = makePurchaseStorageRepo({
          model: mergeStorageModel(defaultPurchaseStorageModels.metadata, overrides?.metadata)
        })
        const webhookEvent = makePurchaseStorageRepo({
          model: mergeStorageModel(defaultPurchaseStorageModels.webhookEvent, overrides?.webhookEvent)
        })

        return {
          checkoutIntent,
          commercialEvent,
          creditLedger,
          customer,
          feature,
          product,
          subscription,
          entitlement,
          invoice,
          metadata,
          providerRef,
          webhookEvent
        }
      })
    )
}
