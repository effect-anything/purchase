import type { PaymentProviderTag } from "../provider.ts"

/**
 * Provider-scoped runtime settings.
 */
export interface PurchaseProviderSettings {
  readonly checkoutUrl?: string | undefined
  readonly webhookUrl?: string | undefined
  readonly checkout?: PurchaseCheckoutSettings | undefined
}

/**
 * Checkout configuration for a provider.
 */
export interface PurchaseCheckoutSettings {
  readonly settings?: PurchaseCheckoutBehaviorSettings | undefined
  readonly paymentMethods?: Partial<PurchaseCheckoutPaymentMethods> | undefined
  readonly overlay?: PurchaseCheckoutOverlaySettings | undefined
  readonly styles?: PurchaseCheckoutStyles | undefined
}

/**
 * Behavioral flags for hosted checkout.
 */
export interface PurchaseCheckoutBehaviorSettings {
  readonly audienceOptin?: boolean | undefined
  readonly checkoutDiscounts?: boolean | undefined
  readonly enableSavedPaymentMethods?: boolean | undefined
  readonly orderConfirmationEmail?:
    | {
        readonly freeCheckoutReceipts?: boolean | undefined
        readonly receiptShowMessage?: boolean | undefined
      }
    | undefined
}

/**
 * Enabled payment methods for hosted checkout.
 */
export interface PurchaseCheckoutPaymentMethods {
  readonly card: boolean
  readonly paypal: boolean
  readonly wireTransfer: boolean
  readonly alipay: boolean
  readonly googlePay: boolean
  readonly applePay: boolean
  readonly ideal: boolean
  readonly bancontact: boolean
  readonly pix: boolean
  readonly upi: boolean
  readonly blik: boolean
  readonly mbway: boolean
  readonly wechat: boolean
  readonly southKoreaLocalCard: boolean
  readonly naverPay: boolean
  readonly kakaoPay: boolean
  readonly samsungPay: boolean
  readonly payco: boolean
}

/**
 * Overlay appearance settings for checkout.
 */
export interface PurchaseCheckoutOverlaySettings {
  readonly brandColor?: string | null | undefined
}

/**
 * Theme overrides for hosted checkout.
 */
export interface PurchaseCheckoutStyles {
  readonly theme?:
    | {
        readonly globals?: PurchaseCheckoutStyleGlobals | undefined
        readonly inputs?: PurchaseCheckoutStyleInputs | undefined
        readonly buttons?: PurchaseCheckoutStyleButtons | undefined
        readonly paddleBar?: PurchaseCheckoutPaddleBarStyles | undefined
        readonly label?: PurchaseCheckoutTextStyle | undefined
        readonly link?: PurchaseCheckoutLinkStyle | undefined
        readonly notification?: PurchaseCheckoutNotificationStyles | undefined
      }
    | undefined
}

/**
 * Global style tokens for checkout.
 */
export interface PurchaseCheckoutStyleGlobals {
  readonly activeFocusBorderColor?: string | undefined
  readonly activeFocusBoxShadowColor?: string | undefined
  readonly borderRadius?: string | undefined
  readonly fontFamily?: string | undefined
  readonly primaryFontSize?: string | undefined
  readonly secondaryFontSize?: string | undefined
  readonly useContainerPadding?: boolean | undefined
  readonly maxWidth?: string | undefined
}

/**
 * Input style overrides for checkout.
 */
export interface PurchaseCheckoutStyleInputs {
  readonly text?: PurchaseCheckoutInputStyle | undefined
  readonly checkbox?:
    | {
        readonly backgroundColor?: string | undefined
        readonly borderRadius?: string | undefined
      }
    | undefined
  readonly select?: PurchaseCheckoutSelectStyle | undefined
  readonly selectFieldWithLabel?: PurchaseCheckoutFieldLabelStyle | undefined
  readonly inputFieldWithLabel?: PurchaseCheckoutFieldLabelStyle | undefined
}

/**
 * Shared text input style options.
 */
export interface PurchaseCheckoutInputStyle {
  readonly activeColor?: string | undefined
  readonly backgroundColor?: string | undefined
  readonly borderColor?: string | undefined
  readonly borderRadius?: string | undefined
  readonly borderWidth?: string | undefined
  readonly color?: string | undefined
  readonly fontSize?: string | undefined
  readonly minHeight?: string | undefined
  readonly placeholderColor?: string | undefined
  readonly withBoxShadow?: boolean | undefined
}

/**
 * Shared select input style options.
 */
export interface PurchaseCheckoutSelectStyle {
  readonly backgroundColor?: string | undefined
  readonly borderColor?: string | undefined
  readonly borderRadius?: string | undefined
  readonly borderWidth?: string | undefined
  readonly color?: string | undefined
  readonly fontSize?: string | undefined
  readonly height?: string | undefined
  readonly minHeight?: string | undefined
  readonly withBoxShadow?: boolean | undefined
}

/**
 * Label layout options for checkout fields.
 */
interface PurchaseCheckoutFieldLabelStyle {
  readonly labelVisible?: boolean | undefined
  readonly labelPosition?: "left" | "right" | "top" | "bottom" | undefined
}

/**
 * Button style overrides for checkout.
 */
export interface PurchaseCheckoutStyleButtons {
  readonly primary?: PurchaseCheckoutButtonStyle | undefined
  readonly secondary?: PurchaseCheckoutButtonStyle | undefined
}

/**
 * Shared button style options.
 */
interface PurchaseCheckoutButtonStyle {
  readonly activeFocusBorderColor?: string | undefined
  readonly activeFocusBoxShadowColor?: string | undefined
  readonly borderColor?: string | undefined
  readonly borderColorHover?: string | undefined
  readonly borderWidth?: string | undefined
  readonly color?: string | undefined
  readonly colorHover?: string | undefined
  readonly backgroundColor?: string | undefined
  readonly backgroundColorHover?: string | undefined
  readonly borderRadius?: string | undefined
  readonly fontSize?: string | undefined
  readonly height?: string | undefined
  readonly width?: string | undefined
}

/**
 * Paddle bar styling options.
 */
export interface PurchaseCheckoutPaddleBarStyles {
  readonly container?: PurchaseCheckoutContainerStyle | undefined
  readonly dataSharedAndPaddleAddress?: PurchaseCheckoutFontStyle | undefined
  readonly paddleMerchantOrderProcess?: PurchaseCheckoutFontStyle | undefined
}

/**
 * Text styling options.
 */
export interface PurchaseCheckoutTextStyle extends PurchaseCheckoutFontStyle {
  readonly color?: string | undefined
  readonly fontWeight?: string | undefined
}

/**
 * Link styling options.
 */
export interface PurchaseCheckoutLinkStyle extends PurchaseCheckoutFontStyle {
  readonly color?: string | undefined
  readonly colorHover?: string | undefined
}

/**
 * Notification styling options.
 */
export interface PurchaseCheckoutNotificationStyles {
  readonly container?: PurchaseCheckoutContainerStyle | undefined
  readonly text?: PurchaseCheckoutFontStyle | undefined
}

/**
 * Container styling options.
 */
export interface PurchaseCheckoutContainerStyle {
  readonly backgroundColor?: string | undefined
  readonly borderColor?: string | undefined
  readonly borderRadius?: string | undefined
}

/**
 * Shared font styling options.
 */
export interface PurchaseCheckoutFontStyle {
  readonly fontSize?: string | undefined
}

/**
 * Root purchase configuration object.
 */
export interface PurchaseConfig<
  TPlans extends ReadonlyArray<unknown> = ReadonlyArray<unknown>,
  TProducts extends ReadonlyArray<unknown> = ReadonlyArray<unknown>
> {
  readonly plans?: TPlans | undefined
  readonly products?: TProducts | undefined
  readonly provider?: Partial<Record<PaymentProviderTag, PurchaseProviderSettings>> | undefined
  readonly providers?: Partial<Record<PaymentProviderTag, PurchaseProviderSettings>> | undefined
}

export const defineConfig = <const TConfig extends PurchaseConfig>(config: TConfig) => config
