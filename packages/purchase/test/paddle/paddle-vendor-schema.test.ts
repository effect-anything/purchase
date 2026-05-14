import { describe, expect, it } from "@effect/vitest"
import * as Effect from "effect/Effect"

import {
  buildPaddleVendorCheckoutSettingsMutationVariables,
  buildPaddleVendorOverlayMutationVariables,
  buildPaddleVendorStylesMutationVariables,
  decodePaddleVendorCheckoutSettingsData,
  decodePaddleVendorCheckoutStylesData,
  decodePaddleVendorOverlaySettingsData,
  decodePaddleVendorSaveCheckoutSettingsResponse,
  decodePaddleVendorSaveOverlaySettingsResponse,
  decodePaddleVendorSaveStylesResponse,
  normalizePaddleVendorCheckoutSnapshot
} from "../../src/paddle/internal/paddle-vendor-schema.ts"

describe("paddle vendor schema", () => {
  it.effect("decodes vendor graphql payloads and normalizes checkout snapshot", () =>
    Effect.gen(function* () {
      const checkoutSettings = yield* decodePaddleVendorCheckoutSettingsData({
        vendorName: "OPRAYNG STUDIO",
        audienceOptin: true,
        checkoutDiscounts: true,
        enableSavedPaymentMethods: false,
        statementDescription: "OPRAYNGSTU",
        vendorFeatures: {
          toggleCardPayments: false,
          wireTransfers: false,
          paypal: true,
          __typename: "CheckoutVendorFeatures"
        },
        defaultCheckoutUrl: {
          url: "https://5a44-89-185-28-24.ngrok-free.app",
          state: "APPROVED",
          __typename: "CheckoutDefaultUrl"
        },
        featureFlags: {
          defaultCheckoutUrl: true,
          showAliPaySetting: false,
          showIdealSetting: true,
          showGooglePaySetting: true,
          showBancontactSetting: true,
          showSavedPaymentMethodsSetting: true,
          showApplePayDomainVerificationTab: true,
          showPixSetting: true,
          showUpiSetting: false,
          showWeChatSetting: true,
          showMBWaySetting: true,
          showBlikSetting: true,
          showSouthKoreaLocalCardSetting: true,
          showNaverPaySetting: true,
          showKakaoPaySetting: true,
          showSamsungPaySetting: true,
          showPaycoSetting: true,
          __typename: "CheckoutFeatureFlags"
        },
        orderConfirmationEmail: {
          freeCheckoutReceipts: false,
          receiptShowMessage: false,
          __typename: "CheckoutOrderConfirmationEmail"
        },
        paymentMethods: {
          card: true,
          paypal: true,
          wireTransfer: false,
          alipay: false,
          googlePay: false,
          applePay: true,
          ideal: false,
          bancontact: true,
          pix: false,
          upi: false,
          blik: false,
          mbway: false,
          wechat: false,
          southKoreaLocalCard: false,
          naverPay: false,
          kakaoPay: false,
          samsungPay: false,
          payco: false,
          __typename: "CheckoutPaymentMethod"
        },
        __typename: "CheckoutSettingsData"
      })

      const overlaySettings = yield* decodePaddleVendorOverlaySettingsData({
        brandColor: null,
        __typename: "OverlaySettingsData"
      })

      const checkoutStyles = yield* decodePaddleVendorCheckoutStylesData({
        theme: {
          globals: {
            activeFocusBorderColor: "#0096FF",
            activeFocusBoxShadowColor: "#C0E6FF",
            borderRadius: "2px",
            fontFamily: "Lato, Helvetica Neue, HelveticaNeue, Helvetica, Arial, sans-serif",
            primaryFontSize: "14px",
            secondaryFontSize: "12px",
            useContainerPadding: true,
            maxWidth: "643px",
            __typename: "CheckoutStylesGlobals"
          },
          inputs: {
            text: {
              activeColor: "#2B2A35",
              backgroundColor: "#FFFFFF",
              borderColor: "#D2D4DE",
              borderRadius: "4px",
              borderWidth: "1px",
              color: "#2B2A35",
              fontSize: "14px",
              minHeight: "40px",
              placeholderColor: "#9393A8",
              withBoxShadow: true,
              __typename: "CheckoutStylesInputsText"
            },
            checkbox: {
              backgroundColor: "#FFFFFF",
              borderRadius: "4px",
              __typename: "CheckoutStylesInputsCheckbox"
            },
            select: {
              backgroundColor: "#FFFFFF",
              borderColor: "#D2D4DE",
              borderRadius: "4px",
              borderWidth: "1px",
              color: "#2B2A35",
              fontSize: "14px",
              height: "40px",
              minHeight: "40px",
              withBoxShadow: true,
              __typename: "CheckoutStylesInputsSelect"
            },
            selectFieldWithLabel: {
              labelVisible: false,
              labelPosition: "left",
              __typename: "CheckoutStylesInputsSelectFieldWithLabel"
            },
            inputFieldWithLabel: {
              labelVisible: false,
              labelPosition: "left",
              __typename: "CheckoutStylesInputsInputFieldWithLabel"
            },
            __typename: "CheckoutStylesInputs"
          },
          buttons: {
            primary: {
              activeFocusBorderColor: "#0096FF",
              activeFocusBoxShadowColor: "#C0E6FF",
              borderColor: "#06C668",
              borderColorHover: "#06C668",
              borderWidth: "1px",
              color: "#FFFFFF",
              colorHover: "#FFFFFF",
              backgroundColor: "#06C668",
              backgroundColorHover: "#05B25E",
              borderRadius: "4px",
              fontSize: "20px",
              height: "44px",
              width: "100%",
              __typename: "CheckoutStylesButtonsPrimary"
            },
            secondary: {
              activeFocusBorderColor: "#0096FF",
              activeFocusBoxShadowColor: "#C0E6FF",
              borderColor: "#06C668",
              borderColorHover: "#05B25E",
              borderWidth: "1px",
              color: "#06C668",
              colorHover: "#05B25E",
              backgroundColor: "#FFFFFF",
              backgroundColorHover: "#FFFFFF",
              borderRadius: "4px",
              fontSize: "14px",
              height: "38px",
              width: "100%",
              __typename: "CheckoutStylesButtonsSecondary"
            },
            __typename: "CheckoutStylesButtons"
          },
          paddleBar: {
            container: {
              backgroundColor: "#FFFFFF",
              borderColor: "#EBECF0",
              borderRadius: "45px",
              __typename: "CheckoutStylesPaddleBarContainer"
            },
            dataSharedAndPaddleAddress: {
              fontSize: "14px",
              __typename: "CheckoutStylesPaddleBarDataSharedAndPaddleAddress"
            },
            paddleMerchantOrderProcess: {
              fontSize: "14px",
              __typename: "CheckoutStylesPaddleBarPaddleMerchantOrderProcess"
            },
            __typename: "CheckoutStylesPaddleBar"
          },
          label: {
            color: "#2B2A35",
            fontSize: "15px",
            fontWeight: "normal",
            __typename: "CheckoutStylesLabel"
          },
          link: {
            color: "#06C668",
            colorHover: "#06C668",
            fontSize: "12px",
            __typename: "CheckoutStylesLink"
          },
          notification: {
            container: {
              backgroundColor: "#FFFFFF",
              borderColor: "#EBECF0",
              borderRadius: "45px",
              __typename: "CheckoutStylesNotificationContainer"
            },
            text: {
              fontSize: "14px",
              __typename: "CheckoutStylesNotificationText"
            },
            __typename: "CheckoutStylesNotification"
          },
          __typename: "CheckoutStylesTheme"
        },
        __typename: "CheckoutStylesData"
      })

      const snapshot = normalizePaddleVendorCheckoutSnapshot({
        checkoutSettings,
        overlaySettings,
        checkoutStyles
      })

      expect(snapshot.checkoutUrl).toBe("https://5a44-89-185-28-24.ngrok-free.app")
      expect(snapshot.checkout.settings?.audienceOptin).toBe(true)
      expect(snapshot.checkout.paymentMethods?.applePay).toBe(true)
      expect(snapshot.checkout.overlay?.brandColor).toBeNull()
      expect(snapshot.checkout.styles?.theme?.buttons?.primary?.backgroundColor).toBe("#06C668")
      expect((snapshot.checkout.styles?.theme as Record<string, unknown>)?.__typename).toBeUndefined()
      expect(
        buildPaddleVendorCheckoutSettingsMutationVariables({
          checkoutUrl: snapshot.checkoutUrl,
          checkout: snapshot.checkout
        })
      ).toEqual({
        checkoutSettingsObject: {
          audienceOptin: true,
          checkoutDiscounts: true,
          enableSavedPaymentMethods: false,
          defaultCheckoutUrl: "https://5a44-89-185-28-24.ngrok-free.app",
          paymentMethods: {
            card: true,
            paypal: true,
            wireTransfer: false,
            alipay: false,
            googlePay: false,
            applePay: true,
            ideal: false,
            bancontact: true,
            pix: false,
            upi: false,
            blik: false,
            mbway: false,
            wechat: false,
            southKoreaLocalCard: false,
            naverPay: false,
            kakaoPay: false,
            samsungPay: false,
            payco: false
          },
          orderConfirmationEmail: {
            freeCheckoutReceipts: false,
            receiptShowMessage: false
          }
        }
      })
      expect(buildPaddleVendorStylesMutationVariables(snapshot.checkout.styles)).toEqual({
        stylesObject: {
          theme: snapshot.checkout.styles?.theme
        }
      })
      expect(buildPaddleVendorOverlayMutationVariables(snapshot.checkout.overlay)).toEqual({
        overlaySettingsObject: {}
      })

      const checkoutSave = yield* decodePaddleVendorSaveCheckoutSettingsResponse({
        saveCheckoutSettings: {
          message: "Changes saved successfully",
          __typename: "SaveCheckoutSettingsResponse"
        }
      })
      const stylesSave = yield* decodePaddleVendorSaveStylesResponse({
        saveStyles: {
          message: "Changes saved successfully",
          __typename: "SaveStylesResponse"
        }
      })
      const overlaySave = yield* decodePaddleVendorSaveOverlaySettingsResponse({
        saveOverlaySettings: {
          message: "Changes saved successfully",
          __typename: "SaveOverlaySettingsResponse"
        }
      })

      expect(checkoutSave.saveCheckoutSettings.message).toBe("Changes saved successfully")
      expect(stylesSave.saveStyles.message).toBe("Changes saved successfully")
      expect(overlaySave.saveOverlaySettings.message).toBe("Changes saved successfully")
    })
  )
})
