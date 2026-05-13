import * as Schema from "effect/Schema"

import type {
  PurchaseCheckoutOverlaySettings,
  PurchaseCheckoutSettings,
  PurchaseCheckoutStyles
} from "../../core/config.ts"

const NullableString = Schema.NullOr(Schema.String)

const CheckoutFieldLabelPosition = Schema.Literal("left", "right", "top", "bottom")

const VendorTypename = Schema.String.pipe(Schema.optionalWith({ exact: true, nullable: true }))

const CheckoutSettingsPaymentMethods = Schema.Struct({
  card: Schema.Boolean,
  paypal: Schema.Boolean,
  wireTransfer: Schema.Boolean,
  alipay: Schema.Boolean,
  googlePay: Schema.Boolean,
  applePay: Schema.Boolean,
  ideal: Schema.Boolean,
  bancontact: Schema.Boolean,
  pix: Schema.Boolean,
  upi: Schema.Boolean,
  blik: Schema.Boolean,
  mbway: Schema.Boolean,
  wechat: Schema.Boolean,
  southKoreaLocalCard: Schema.Boolean,
  naverPay: Schema.Boolean,
  kakaoPay: Schema.Boolean,
  samsungPay: Schema.Boolean,
  payco: Schema.Boolean,
  __typename: VendorTypename
})

const CheckoutStyleGlobals = Schema.Struct({
  activeFocusBorderColor: Schema.String,
  activeFocusBoxShadowColor: Schema.String,
  borderRadius: Schema.String,
  fontFamily: Schema.String,
  primaryFontSize: Schema.String,
  secondaryFontSize: Schema.String,
  useContainerPadding: Schema.Boolean,
  maxWidth: Schema.String,
  __typename: VendorTypename
})

const CheckoutStyleInput = Schema.Struct({
  activeColor: Schema.String,
  backgroundColor: Schema.String,
  borderColor: Schema.String,
  borderRadius: Schema.String,
  borderWidth: Schema.String,
  color: Schema.String,
  fontSize: Schema.String,
  minHeight: Schema.String,
  placeholderColor: Schema.String,
  withBoxShadow: Schema.Boolean,
  __typename: VendorTypename
})

const CheckoutStyleCheckbox = Schema.Struct({
  backgroundColor: Schema.String,
  borderRadius: Schema.String,
  __typename: VendorTypename
})

const CheckoutStyleSelect = Schema.Struct({
  backgroundColor: Schema.String,
  borderColor: Schema.String,
  borderRadius: Schema.String,
  borderWidth: Schema.String,
  color: Schema.String,
  fontSize: Schema.String,
  height: Schema.String,
  minHeight: Schema.String,
  withBoxShadow: Schema.Boolean,
  __typename: VendorTypename
})

const CheckoutStyleFieldLabel = Schema.Struct({
  labelVisible: Schema.Boolean,
  labelPosition: CheckoutFieldLabelPosition,
  __typename: VendorTypename
})

const CheckoutStyleButton = Schema.Struct({
  activeFocusBorderColor: Schema.String,
  activeFocusBoxShadowColor: Schema.String,
  borderColor: Schema.String,
  borderColorHover: Schema.String,
  borderWidth: Schema.String,
  color: Schema.String,
  colorHover: Schema.String,
  backgroundColor: Schema.String,
  backgroundColorHover: Schema.String,
  borderRadius: Schema.String,
  fontSize: Schema.String,
  height: Schema.String,
  width: Schema.String,
  __typename: VendorTypename
})

const CheckoutStyleContainer = Schema.Struct({
  backgroundColor: Schema.String,
  borderColor: Schema.String,
  borderRadius: Schema.String,
  __typename: VendorTypename
})

const CheckoutStyleFont = Schema.Struct({
  fontSize: Schema.String,
  __typename: VendorTypename
})

const CheckoutStyleText = Schema.Struct({
  color: Schema.String,
  fontSize: Schema.String,
  fontWeight: Schema.String,
  __typename: VendorTypename
})

const CheckoutStyleLink = Schema.Struct({
  color: Schema.String,
  colorHover: Schema.String,
  fontSize: Schema.String,
  __typename: VendorTypename
})

export const PaddleVendorCheckoutSettingsData = Schema.Struct({
  vendorName: Schema.String,
  audienceOptin: Schema.Boolean,
  checkoutDiscounts: Schema.Boolean,
  enableSavedPaymentMethods: Schema.Boolean,
  statementDescription: Schema.String,
  vendorFeatures: Schema.Struct({
    toggleCardPayments: Schema.Boolean,
    wireTransfers: Schema.Boolean,
    paypal: Schema.Boolean,
    __typename: VendorTypename
  }),
  defaultCheckoutUrl: Schema.Struct({
    url: Schema.String,
    state: Schema.String,
    __typename: VendorTypename
  }),
  featureFlags: Schema.Struct({
    defaultCheckoutUrl: Schema.Boolean,
    showAliPaySetting: Schema.Boolean,
    showIdealSetting: Schema.Boolean,
    showGooglePaySetting: Schema.Boolean,
    showBancontactSetting: Schema.Boolean,
    showSavedPaymentMethodsSetting: Schema.Boolean,
    showApplePayDomainVerificationTab: Schema.Boolean,
    showPixSetting: Schema.Boolean,
    showUpiSetting: Schema.Boolean,
    showWeChatSetting: Schema.Boolean,
    showMBWaySetting: Schema.Boolean,
    showBlikSetting: Schema.Boolean,
    showSouthKoreaLocalCardSetting: Schema.Boolean,
    showNaverPaySetting: Schema.Boolean,
    showKakaoPaySetting: Schema.Boolean,
    showSamsungPaySetting: Schema.Boolean,
    showPaycoSetting: Schema.Boolean,
    __typename: VendorTypename
  }),
  orderConfirmationEmail: Schema.Struct({
    freeCheckoutReceipts: Schema.Boolean,
    receiptShowMessage: Schema.Boolean,
    __typename: VendorTypename
  }),
  paymentMethods: CheckoutSettingsPaymentMethods,
  __typename: VendorTypename
})
export type PaddleVendorCheckoutSettingsData = typeof PaddleVendorCheckoutSettingsData.Type

export const PaddleVendorOverlaySettingsData = Schema.Struct({
  brandColor: NullableString,
  __typename: VendorTypename
})
export type PaddleVendorOverlaySettingsData = typeof PaddleVendorOverlaySettingsData.Type

export const PaddleVendorCheckoutStylesData = Schema.Struct({
  theme: Schema.Struct({
    globals: CheckoutStyleGlobals,
    inputs: Schema.Struct({
      text: CheckoutStyleInput,
      checkbox: CheckoutStyleCheckbox,
      select: CheckoutStyleSelect,
      selectFieldWithLabel: CheckoutStyleFieldLabel,
      inputFieldWithLabel: CheckoutStyleFieldLabel,
      __typename: VendorTypename
    }),
    buttons: Schema.Struct({
      primary: CheckoutStyleButton,
      secondary: CheckoutStyleButton,
      __typename: VendorTypename
    }),
    paddleBar: Schema.Struct({
      container: CheckoutStyleContainer,
      dataSharedAndPaddleAddress: CheckoutStyleFont,
      paddleMerchantOrderProcess: CheckoutStyleFont,
      __typename: VendorTypename
    }),
    label: CheckoutStyleText,
    link: CheckoutStyleLink,
    notification: Schema.Struct({
      container: CheckoutStyleContainer,
      text: CheckoutStyleFont,
      __typename: VendorTypename
    }),
    __typename: VendorTypename
  }),
  __typename: VendorTypename
})
export type PaddleVendorCheckoutStylesData = typeof PaddleVendorCheckoutStylesData.Type

export const decodePaddleVendorCheckoutSettingsData = Schema.decodeUnknown(PaddleVendorCheckoutSettingsData)
export const decodePaddleVendorOverlaySettingsData = Schema.decodeUnknown(PaddleVendorOverlaySettingsData)
export const decodePaddleVendorCheckoutStylesData = Schema.decodeUnknown(PaddleVendorCheckoutStylesData)

export const PaddleVendorMutationMessage = Schema.Struct({
  message: Schema.String,
  __typename: VendorTypename
})
export type PaddleVendorMutationMessage = typeof PaddleVendorMutationMessage.Type

export const PaddleVendorSaveCheckoutSettingsResponse = Schema.Struct({
  saveCheckoutSettings: PaddleVendorMutationMessage
})
export const PaddleVendorSaveStylesResponse = Schema.Struct({
  saveStyles: PaddleVendorMutationMessage
})
export const PaddleVendorSaveOverlaySettingsResponse = Schema.Struct({
  saveOverlaySettings: PaddleVendorMutationMessage
})

export const decodePaddleVendorSaveCheckoutSettingsResponse = Schema.decodeUnknown(
  PaddleVendorSaveCheckoutSettingsResponse
)
export const decodePaddleVendorSaveStylesResponse = Schema.decodeUnknown(PaddleVendorSaveStylesResponse)
export const decodePaddleVendorSaveOverlaySettingsResponse = Schema.decodeUnknown(
  PaddleVendorSaveOverlaySettingsResponse
)

export interface PaddleVendorCheckoutSnapshot {
  readonly checkoutUrl?: string | undefined
  readonly checkout: PurchaseCheckoutSettings & {
    readonly overlay?:
      | {
          readonly brandColor?: string | null | undefined
        }
      | undefined
  }
}

export const normalizePaddleVendorCheckoutSnapshot = (input: {
  readonly checkoutSettings: PaddleVendorCheckoutSettingsData
  readonly overlaySettings: PaddleVendorOverlaySettingsData
  readonly checkoutStyles: PaddleVendorCheckoutStylesData
}): PaddleVendorCheckoutSnapshot => ({
  checkoutUrl: input.checkoutSettings.defaultCheckoutUrl.url,
  checkout: {
    settings: {
      audienceOptin: input.checkoutSettings.audienceOptin,
      checkoutDiscounts: input.checkoutSettings.checkoutDiscounts,
      enableSavedPaymentMethods: input.checkoutSettings.enableSavedPaymentMethods,
      orderConfirmationEmail: {
        freeCheckoutReceipts: input.checkoutSettings.orderConfirmationEmail.freeCheckoutReceipts,
        receiptShowMessage: input.checkoutSettings.orderConfirmationEmail.receiptShowMessage
      }
    },
    paymentMethods: omitTypename(input.checkoutSettings.paymentMethods),
    overlay: {
      brandColor: input.overlaySettings.brandColor
    },
    styles: {
      theme: omitTypenameDeep(input.checkoutStyles.theme)
    }
  }
})

export const buildPaddleVendorCheckoutSettingsMutationVariables = (input: {
  readonly checkoutUrl?: string | undefined
  readonly checkout?: PurchaseCheckoutSettings | undefined
}) => ({
  checkoutSettingsObject: compactUndefined({
    audienceOptin: input.checkout?.settings?.audienceOptin,
    checkoutDiscounts: input.checkout?.settings?.checkoutDiscounts,
    statementDescription: undefined,
    enableSavedPaymentMethods: input.checkout?.settings?.enableSavedPaymentMethods,
    defaultCheckoutUrl: input.checkoutUrl,
    paymentMethods: input.checkout?.paymentMethods,
    orderConfirmationEmail: input.checkout?.settings?.orderConfirmationEmail
  })
})

export const buildPaddleVendorStylesMutationVariables = (styles: PurchaseCheckoutStyles | undefined) => ({
  stylesObject: compactUndefined({
    theme: styles?.theme
  })
})

export const buildPaddleVendorOverlayMutationVariables = (overlay: PurchaseCheckoutOverlaySettings | undefined) => ({
  overlaySettingsObject: compactUndefined({
    brandColor: overlay?.brandColor ?? undefined
  })
})

const omitTypename = <T extends { readonly __typename?: string | null | undefined }>(
  value: T
): Omit<T, "__typename"> => {
  const { __typename: _typename, ...rest } = value
  return rest
}

const omitTypenameDeep = <T>(value: T): T => {
  if (Array.isArray(value)) {
    return value.map((entry) => omitTypenameDeep(entry)) as T
  }
  if (!value || typeof value !== "object") {
    return value
  }

  return Object.fromEntries(
    Object.entries(value)
      .filter(([key]) => key !== "__typename")
      .map(([key, entry]) => [key, omitTypenameDeep(entry)])
  ) as T
}

const compactUndefined = <T>(value: T): T => {
  if (Array.isArray(value)) {
    return value.map((entry) => compactUndefined(entry)) as T
  }
  if (!value || typeof value !== "object") {
    return value
  }

  return Object.fromEntries(
    Object.entries(value)
      .filter(([, entry]) => entry !== undefined)
      .map(([key, entry]) => [key, compactUndefined(entry)])
  ) as T
}
