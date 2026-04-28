import { describe, expect, it } from "@effect/vitest"
import { Effect } from "effect"
import { createInstance } from "i18next"

import { makeI18nLayer, makeI18nService } from "../src/i18n.server.ts"
import { changeLanguage, getI18nKey, language, languages, locale, resolveLanguage, t } from "../src/i18n.ts"

const createTestInstance = async () => {
  const instance = createInstance()

  await instance.init({
    resources: {
      en: {
        translation: {
          greeting: "Hello",
          nested: {
            title: "Welcome"
          }
        }
      },
      "zh-Hans": {
        translation: {
          greeting: "你好",
          nested: {
            title: "欢迎"
          }
        }
      }
    },
    defaultNS: "translation",
    fallbackLng: "en",
    lng: "zh-Hans",
    ns: ["translation"],
    supportedLngs: ["en", "zh-Hans"]
  })

  return instance
}

describe("i18n services", () => {
  it.effect("wraps an i18next instance with the server service contract", () =>
    Effect.gen(function* () {
      const instance = yield* Effect.promise(createTestInstance)
      const service = makeI18nService(instance)

      expect(service.language()).toBe("zh-Hans")
      expect(service.resolveLanguage()).toBe("zh-Hans")
      expect(service.locale()).toBe("zh-Hans")
      expect(service.languages()).toContain("zh-Hans")
      expect(service.languages()).toContain("en")
      expect(service.t("greeting")).toBe("你好")
      expect(service.t(["title"], { keyPrefix: "nested" })).toEqual(["欢迎"])

      yield* service.changeLanguage("en")

      expect(service.language()).toBe("en")
      expect(service.locale()).toBe("en")
      expect(service.t("greeting")).toBe("Hello")
    })
  )

  it.effect("provides the effect helpers through the shared i18n layer", () =>
    Effect.gen(function* () {
      const instance = yield* Effect.promise(createTestInstance)
      const layer = makeI18nLayer(instance)

      const initial = yield* Effect.all({
        currentLanguage: language,
        currentLanguages: languages,
        currentLocale: locale,
        currentResolvedLanguage: resolveLanguage,
        greeting: t("greeting"),
        nestedTitle: t(["title"], { keyPrefix: "nested" })
      }).pipe(Effect.provide(layer))

      expect(getI18nKey("greeting")).toBe("greeting")
      expect(initial.currentLanguage).toBe("zh-Hans")
      expect(initial.currentLanguages).toContain("zh-Hans")
      expect(initial.currentLanguages).toContain("en")
      expect(initial.currentResolvedLanguage).toBe("zh-Hans")
      expect(initial.currentLocale).toBe("zh-Hans")
      expect(initial.greeting).toBe("你好")
      expect(initial.nestedTitle).toEqual(["欢迎"])

      yield* changeLanguage("en").pipe(Effect.provide(layer))

      const greeting = yield* t("greeting").pipe(Effect.provide(layer))
      const nextLocale = yield* locale.pipe(Effect.provide(layer))

      expect(greeting).toBe("Hello")
      expect(nextLocale).toBe("en")
    })
  )
})
