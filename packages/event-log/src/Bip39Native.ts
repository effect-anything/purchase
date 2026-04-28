import type * as Context from "effect/Context"

import { Bip39 } from "./Bip39.ts"
import * as Types from "./Types.ts"
import ExpoBip39 from "@effect-x/expo-bip39"
import { generateMnemonic as bip39GenerateMnemonic, validateMnemonic } from "@scure/bip39"
import { wordlist } from "@scure/bip39/wordlists/english.js"
import * as Effect from "effect/Effect"
import * as Layer from "effect/Layer"

export const Bip39Live = Layer.effect(
  Bip39,
  Effect.gen(function* () {
    const generateMnemonic = (strength: 128 | 256 = 128) =>
      Effect.sync(() => Types.Mnemonic.make(bip39GenerateMnemonic(wordlist, strength)))

    const validateMnemonic_ = (mnemonic: string) => Effect.sync(() => validateMnemonic(mnemonic.trim(), wordlist))

    const mnemonicToSeed = (mnemonic: string, password = "") =>
      Effect.promise(() => ExpoBip39.mnemonicToSeed(mnemonic.trim(), password))

    return {
      generateMnemonic,
      validateMnemonic: validateMnemonic_,
      mnemonicToSeed
    } satisfies Context.Tag.Service<Bip39>
  })
)
