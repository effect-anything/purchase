import type { i18n as I18nInstance } from "i18next"

import * as Effect from "effect/Effect"
import * as Layer from "effect/Layer"

import { I18n, type TranslationT } from "./i18n.ts"
import { resolveLocaleFromLanguage } from "./locale-utils.ts"

export const makeI18nService = (instance: I18nInstance): I18n => ({
  language: () => instance.language ?? "en",
  languages: () => instance.languages,
  resolveLanguage: () => instance.resolvedLanguage,
  locale: () => resolveLocaleFromLanguage(instance.language, ["en"]),
  changeLanguage: (lng: string) =>
    Effect.promise(() =>
      instance.changeLanguage(lng).then(() => {
        return undefined
      })
    ),
  t: ((key: string | Array<string>, options?: Parameters<TranslationT>[1]) => {
    const fixedT = instance.getFixedT(
      (options?.language || instance.language) as any,
      (options?.namespace || "translation") as any,
      options?.keyPrefix
    ) as any

    if (typeof key === "string") {
      return fixedT(key)
    }

    return key.map((item) => fixedT(item))
  }) as TranslationT
})

export const makeI18nLayer = (instance: I18nInstance) => Layer.succeed(I18n, makeI18nService(instance))
