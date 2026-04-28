import type * as Model from "@effect/sql/Model"
import type * as Schema from "effect/Schema"

import { ColumnConfigTypeId } from "@effect-x/db/schema"
import * as SqlClient from "@effect/sql/SqlClient"
import * as Context from "effect/Context"
import * as Effect from "effect/Effect"
import * as Layer from "effect/Layer"
import * as Option from "effect/Option"

import * as DB from "./tables.ts"

export type PayStorageModel<TKey extends string> = {
  readonly model: PayDbModel
  readonly fieldKeys: Record<TKey, string>
  readonly modelName: string
  readonly fields: Record<TKey, string>
}

type PayDbModel = Model.AnyNoContext & {
  readonly table: string
  readonly fields: Schema.Struct.Fields
}

type PayDbModelFieldKey<TModel extends PayDbModel> = Extract<keyof Schema.Schema.Type<TModel>, string>

export type PayStorageModelBinding<
  TModel extends PayDbModel,
  TFields extends Record<string, PayDbModelFieldKey<TModel>>
> = {
  readonly model: TModel
  readonly fields: TFields
}

export type PayStorageRecordFromBinding<TBinding extends PayStorageModelBinding<PayDbModel, Record<string, string>>> = {
  readonly [K in keyof TBinding["fields"]]: Schema.Schema.Type<TBinding["model"]>[TBinding["fields"][K]]
}

export type PayStorageRecordFromModel<TModel extends PayStorageModel<string>> = {
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

export const definePayStorageModel = <
  TModel extends PayDbModel,
  const TFields extends Record<string, PayDbModelFieldKey<TModel>>
>(
  binding: PayStorageModelBinding<TModel, TFields>
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

export const defaultPayStorageModels = {
  customer: definePayStorageModel({
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
  feature: definePayStorageModel({
    model: DB.Feature,
    fields: {
      id: "id",
      type: "type",
      createdAt: "createdAt",
      updatedAt: "updatedAt"
    }
  }),
  checkoutIntent: definePayStorageModel({
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
  commercialEvent: definePayStorageModel({
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
  creditLedger: definePayStorageModel({
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
  product: definePayStorageModel({
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
  providerRef: definePayStorageModel({
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
  subscription: definePayStorageModel({
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
  entitlement: definePayStorageModel({
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
  invoice: definePayStorageModel({
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
  metadata: definePayStorageModel({
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
  webhookEvent: definePayStorageModel({
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

export type PartialPayStorageModel<TModel extends PayStorageModel<string>> = {
  readonly modelName?: string | undefined
  readonly fields?: Partial<TModel["fields"]> | undefined
}

export interface PayStorageOverrides {
  readonly checkoutIntent?: PartialPayStorageModel<PayCheckoutIntentModel> | undefined
  readonly commercialEvent?: PartialPayStorageModel<PayCommercialEventModel> | undefined
  readonly creditLedger?: PartialPayStorageModel<PayCreditLedgerModel> | undefined
  readonly customer?: PartialPayStorageModel<PayCustomerModel> | undefined
  readonly feature?: PartialPayStorageModel<PayFeatureModel> | undefined
  readonly product?: PartialPayStorageModel<PayProductModel> | undefined
  readonly providerRef?: PartialPayStorageModel<PayProviderRefModel> | undefined
  readonly subscription?: PartialPayStorageModel<PaySubscriptionModel> | undefined
  readonly entitlement?: PartialPayStorageModel<PayEntitlementModel> | undefined
  readonly invoice?: PartialPayStorageModel<PayInvoiceModel> | undefined
  readonly metadata?: PartialPayStorageModel<PayMetadataModel> | undefined
  readonly webhookEvent?: PartialPayStorageModel<PayWebhookEventModel> | undefined
}

export type PayStorageCustomerRecord = PayStorageRecordFromBinding<{
  readonly model: typeof DB.Customer
  readonly fields: typeof defaultPayStorageModels.customer.fieldKeys
}>

export type PayStorageCheckoutIntentRecord = PayStorageRecordFromBinding<{
  readonly model: typeof DB.CheckoutIntent
  readonly fields: typeof defaultPayStorageModels.checkoutIntent.fieldKeys
}>

export type PayStorageCommercialEventRecord = PayStorageRecordFromBinding<{
  readonly model: typeof DB.CommercialEvent
  readonly fields: typeof defaultPayStorageModels.commercialEvent.fieldKeys
}>

export type PayStorageCreditLedgerRecord = PayStorageRecordFromBinding<{
  readonly model: typeof DB.CreditLedger
  readonly fields: typeof defaultPayStorageModels.creditLedger.fieldKeys
}>

export type PayStorageSubscriptionRecord = PayStorageRecordFromBinding<{
  readonly model: typeof DB.Subscription
  readonly fields: typeof defaultPayStorageModels.subscription.fieldKeys
}>

export type PayStorageProductRecord = PayStorageRecordFromBinding<{
  readonly model: typeof DB.Product
  readonly fields: typeof defaultPayStorageModels.product.fieldKeys
}>

export type PayStorageProviderRefRecord = PayStorageRecordFromBinding<{
  readonly model: typeof DB.ProviderRef
  readonly fields: typeof defaultPayStorageModels.providerRef.fieldKeys
}>

export type PayStorageFeatureRecord = PayStorageRecordFromBinding<{
  readonly model: typeof DB.Feature
  readonly fields: typeof defaultPayStorageModels.feature.fieldKeys
}>

export type PayStorageEntitlementRecord = PayStorageRecordFromBinding<{
  readonly model: typeof DB.Entitlement
  readonly fields: typeof defaultPayStorageModels.entitlement.fieldKeys
}>

export type PayStorageInvoiceRecord = PayStorageRecordFromBinding<{
  readonly model: typeof DB.Invoice
  readonly fields: typeof defaultPayStorageModels.invoice.fieldKeys
}>

export type PayStorageMetadataRecord = PayStorageRecordFromBinding<{
  readonly model: typeof DB.Metadata
  readonly fields: typeof defaultPayStorageModels.metadata.fieldKeys
}>

export type PayStorageWebhookEventRecord = PayStorageRecordFromBinding<{
  readonly model: typeof DB.WebhookEvent
  readonly fields: typeof defaultPayStorageModels.webhookEvent.fieldKeys
}>

export type PayStorageWhere<TModel extends PayStorageModel<string>> = ReadonlyArray<
  readonly [keyof TModel["fields"], unknown]
>

export type PayStorageOrderBy<TModel extends PayStorageModel<string>> = readonly [
  keyof TModel["fields"],
  "asc" | "desc"
]

export interface PayStorageFindFirstInput<TModel extends PayStorageModel<string>> {
  readonly where?: PayStorageWhere<TModel> | undefined
  readonly orderBy?: PayStorageOrderBy<TModel> | undefined
}

export interface PayStorageFindManyInput<TModel extends PayStorageModel<string>> {
  readonly where?: PayStorageWhere<TModel> | undefined
  readonly orderBy?: PayStorageOrderBy<TModel> | undefined
  readonly limit?: number | undefined
}

export type PayStorageValues<TModel extends PayStorageModel<string>> = Partial<PayStorageRecordFromModel<TModel>>

export interface PayStorageInsertInput<TModel extends PayStorageModel<string>> {
  readonly values: PayStorageValues<TModel>
}

export interface PayStorageUpdateFirstInput<TModel extends PayStorageModel<string>> {
  readonly where: PayStorageWhere<TModel>
  readonly set: PayStorageValues<TModel>
  readonly orderBy?: PayStorageOrderBy<TModel> | undefined
}

export interface PayStorageDeleteManyInput<TModel extends PayStorageModel<string>> {
  readonly where?: PayStorageWhere<TModel> | undefined
}

export interface PayStorageRepo<TModel extends PayStorageModel<string>> {
  readonly findFirst: (
    input: PayStorageFindFirstInput<TModel>
  ) => Effect.Effect<Option.Option<PayStorageRecordFromModel<TModel>>, unknown>
  readonly findMany: (
    input: PayStorageFindManyInput<TModel>
  ) => Effect.Effect<ReadonlyArray<PayStorageRecordFromModel<TModel>>, unknown>
  readonly insert: (input: PayStorageInsertInput<TModel>) => Effect.Effect<PayStorageRecordFromModel<TModel>, unknown>
  readonly updateFirst: (
    input: PayStorageUpdateFirstInput<TModel>
  ) => Effect.Effect<Option.Option<PayStorageRecordFromModel<TModel>>, unknown>
  readonly deleteMany: (input: PayStorageDeleteManyInput<TModel>) => Effect.Effect<void, unknown>
}

const mergeStorageModel = <TModel extends PayStorageModel<string>>(
  model: TModel,
  override: PartialPayStorageModel<TModel> | undefined
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

const getModelColumn = <TModel extends PayStorageModel<string>>(model: TModel, field: keyof TModel["fields"]) =>
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

const buildWhereClause = <TModel extends PayStorageModel<string>>(
  model: TModel,
  where: PayStorageWhere<TModel> | undefined
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

const buildOrderClause = <TModel extends PayStorageModel<string>>(
  model: TModel,
  orderBy: PayStorageOrderBy<TModel> | undefined
) => {
  if (!orderBy) {
    return ""
  }

  return ` ORDER BY ${quoteIdentifier(getModelColumn(model, orderBy[0]))} ${orderBy[1].toUpperCase()}`
}

const buildInsertClause = <TModel extends PayStorageModel<string>>(model: TModel, values: PayStorageValues<TModel>) => {
  const entries = Object.entries(values).filter(([, value]) => value !== undefined) as ReadonlyArray<
    readonly [keyof TModel["fields"], unknown]
  >

  return {
    columns: entries.map(([field]) => quoteIdentifier(getModelColumn(model, field))).join(", "),
    params: entries.map(([, value]) => encodeStorageValue(value)),
    placeholders: entries.map(() => "?").join(", ")
  }
}

const buildSetClause = <TModel extends PayStorageModel<string>>(model: TModel, values: PayStorageValues<TModel>) => {
  const entries = Object.entries(values).filter(([, value]) => value !== undefined) as ReadonlyArray<
    readonly [keyof TModel["fields"], unknown]
  >

  return {
    params: entries.map(([, value]) => encodeStorageValue(value)),
    sql: entries.map(([field]) => `${quoteIdentifier(getModelColumn(model, field))} = ?`).join(", ")
  }
}

export type PayCheckoutIntentModel = typeof defaultPayStorageModels.checkoutIntent
export type PayCommercialEventModel = typeof defaultPayStorageModels.commercialEvent
export type PayCreditLedgerModel = typeof defaultPayStorageModels.creditLedger
export type PayCustomerModel = typeof defaultPayStorageModels.customer
export type PayFeatureModel = typeof defaultPayStorageModels.feature
export type PaySubscriptionModel = typeof defaultPayStorageModels.subscription
export type PayEntitlementModel = typeof defaultPayStorageModels.entitlement
export type PayInvoiceModel = typeof defaultPayStorageModels.invoice
export type PayMetadataModel = typeof defaultPayStorageModels.metadata
export type PayWebhookEventModel = typeof defaultPayStorageModels.webhookEvent
export type PayProductModel = typeof defaultPayStorageModels.product
export type PayProviderRefModel = typeof defaultPayStorageModels.providerRef

export class PayStorageAdapter extends Context.Tag("@xstack/pay/PayStorageAdapter")<
  PayStorageAdapter,
  {
    readonly checkoutIntent: PayStorageRepo<PayCheckoutIntentModel>
    readonly commercialEvent: PayStorageRepo<PayCommercialEventModel>
    readonly creditLedger: PayStorageRepo<PayCreditLedgerModel>
    readonly customer: PayStorageRepo<PayCustomerModel>
    readonly feature: PayStorageRepo<PayFeatureModel>
    readonly product: PayStorageRepo<PayProductModel>
    readonly subscription: PayStorageRepo<PaySubscriptionModel>
    readonly entitlement: PayStorageRepo<PayEntitlementModel>
    readonly invoice: PayStorageRepo<PayInvoiceModel>
    readonly metadata: PayStorageRepo<PayMetadataModel>
    readonly providerRef: PayStorageRepo<PayProviderRefModel>
    readonly webhookEvent: PayStorageRepo<PayWebhookEventModel>
  }
>() {
  static make = (overrides?: PayStorageOverrides | undefined) =>
    Layer.effect(
      PayStorageAdapter,
      Effect.gen(function* () {
        const sql = yield* SqlClient.SqlClient

        const makePayStorageRepo = <TModel extends PayStorageModel<string>>(input: {
          readonly model: TModel
        }): PayStorageRepo<TModel> => {
          const findFirst: PayStorageRepo<TModel>["findFirst"] = ({ where, orderBy }) => {
            const select = selectColumns(input.model.fields)
            const whereClause = buildWhereClause(input.model, where)
            const orderClause = buildOrderClause(input.model, orderBy)

            return runUnsafeOne(
              sql,
              `SELECT ${select} FROM ${quoteIdentifier(input.model.modelName)}${whereClause.sql}${orderClause} LIMIT 1`,
              whereClause.params
            )
          }

          const findMany: PayStorageRepo<TModel>["findMany"] = ({ where, orderBy, limit }) => {
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

          const insert: PayStorageRepo<TModel>["insert"] = ({ values }) => {
            const select = selectColumns(input.model.fields)
            const insertClause = buildInsertClause(input.model, values)

            return runUnsafeOne<PayStorageRecordFromModel<TModel>>(
              sql,
              `INSERT INTO ${quoteIdentifier(input.model.modelName)} (${insertClause.columns}) VALUES (${insertClause.placeholders}) RETURNING ${select}`,
              insertClause.params
            ).pipe(Effect.map(Option.getOrThrow))
          }

          const updateFirst: PayStorageRepo<TModel>["updateFirst"] = ({ where, set, orderBy }) => {
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

          const deleteMany: PayStorageRepo<TModel>["deleteMany"] = ({ where }) => {
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

        const checkoutIntent = makePayStorageRepo({
          model: mergeStorageModel(defaultPayStorageModels.checkoutIntent, overrides?.checkoutIntent)
        })
        const commercialEvent = makePayStorageRepo({
          model: mergeStorageModel(defaultPayStorageModels.commercialEvent, overrides?.commercialEvent)
        })
        const creditLedger = makePayStorageRepo({
          model: mergeStorageModel(defaultPayStorageModels.creditLedger, overrides?.creditLedger)
        })
        const customer = makePayStorageRepo({
          model: mergeStorageModel(defaultPayStorageModels.customer, overrides?.customer)
        })
        const feature = makePayStorageRepo({
          model: mergeStorageModel(defaultPayStorageModels.feature, overrides?.feature)
        })
        const product = makePayStorageRepo({
          model: mergeStorageModel(defaultPayStorageModels.product, overrides?.product)
        })
        const providerRef = makePayStorageRepo({
          model: mergeStorageModel(defaultPayStorageModels.providerRef, overrides?.providerRef)
        })
        const subscription = makePayStorageRepo({
          model: mergeStorageModel(defaultPayStorageModels.subscription, overrides?.subscription)
        })
        const entitlement = makePayStorageRepo({
          model: mergeStorageModel(defaultPayStorageModels.entitlement, overrides?.entitlement)
        })
        const invoice = makePayStorageRepo({
          model: mergeStorageModel(defaultPayStorageModels.invoice, overrides?.invoice)
        })
        const metadata = makePayStorageRepo({
          model: mergeStorageModel(defaultPayStorageModels.metadata, overrides?.metadata)
        })
        const webhookEvent = makePayStorageRepo({
          model: mergeStorageModel(defaultPayStorageModels.webhookEvent, overrides?.webhookEvent)
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
