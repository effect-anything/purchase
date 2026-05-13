import type { PaymentProviderTag } from '../provider.ts';

export interface PurchaseProviderSettings {
  readonly checkoutUrl?: string | undefined
  readonly webhookUrl?: string | undefined
  readonly checkout?: PurchaseCheckoutSettings | undefined
}

interface PurchaseCheckoutSettings {
  readonly settings?: PurchaseCheckoutBehaviorSettings | undefined
  readonly paymentMethods?: Partial<PurchaseCheckoutPaymentMethods> | undefined
  readonly overlay?: PurchaseCheckoutOverlaySettings | undefined
  readonly styles?: PurchaseCheckoutStyles | undefined
}

interface PurchaseCheckoutBehaviorSettings {
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

interface PurchaseCheckoutPaymentMethods {
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

interface PurchaseCheckoutOverlaySettings {
  readonly brandColor?: string | null | undefined
}

interface PurchaseCheckoutStyles {
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

interface PurchaseCheckoutStyleGlobals {
  readonly activeFocusBorderColor?: string | undefined
  readonly activeFocusBoxShadowColor?: string | undefined
  readonly borderRadius?: string | undefined
  readonly fontFamily?: string | undefined
  readonly primaryFontSize?: string | undefined
  readonly secondaryFontSize?: string | undefined
  readonly useContainerPadding?: boolean | undefined
  readonly maxWidth?: string | undefined
}

interface PurchaseCheckoutStyleInputs {
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

interface PurchaseCheckoutInputStyle {
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

interface PurchaseCheckoutSelectStyle {
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

interface PurchaseCheckoutFieldLabelStyle {
  readonly labelVisible?: boolean | undefined
  readonly labelPosition?: "left" | "right" | "top" | "bottom" | undefined
}

interface PurchaseCheckoutStyleButtons {
  readonly primary?: PurchaseCheckoutButtonStyle | undefined
  readonly secondary?: PurchaseCheckoutButtonStyle | undefined
}

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

interface PurchaseCheckoutPaddleBarStyles {
  readonly container?: PurchaseCheckoutContainerStyle | undefined
  readonly dataSharedAndPaddleAddress?: PurchaseCheckoutFontStyle | undefined
  readonly paddleMerchantOrderProcess?: PurchaseCheckoutFontStyle | undefined
}

interface PurchaseCheckoutTextStyle extends PurchaseCheckoutFontStyle {
  readonly color?: string | undefined
  readonly fontWeight?: string | undefined
}

interface PurchaseCheckoutLinkStyle extends PurchaseCheckoutFontStyle {
  readonly color?: string | undefined
  readonly colorHover?: string | undefined
}

interface PurchaseCheckoutNotificationStyles {
  readonly container?: PurchaseCheckoutContainerStyle | undefined
  readonly text?: PurchaseCheckoutFontStyle | undefined
}

interface PurchaseCheckoutContainerStyle {
  readonly backgroundColor?: string | undefined
  readonly borderColor?: string | undefined
  readonly borderRadius?: string | undefined
}

interface PurchaseCheckoutFontStyle {
  readonly fontSize?: string | undefined
}

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