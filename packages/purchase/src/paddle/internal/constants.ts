export const PADDLE_WEBHOOK_SUBSCRIBED_EVENTS = [
  "adjustment.created",
  "adjustment.updated",
  "customer.created",
  "customer.updated",
  "subscription.activated",
  "subscription.canceled",
  "subscription.created",
  "subscription.past_due",
  "subscription.paused",
  "subscription.resumed",
  "subscription.trialing",
  "subscription.updated",
  "transaction.billed",
  "transaction.canceled",
  "transaction.completed",
  "transaction.created",
  "transaction.paid",
  "transaction.payment_failed",
  "transaction.ready",
  "transaction.updated"
] as const

export const GET_CHECKOUT_SETTINGS_QUERY = `query GetCheckoutSettings {
  getDomainReviews {
    id
    domain
    status
    applePayVerificationStatus
    events {
      type
      time
      __typename
    }
    __typename
  }
  getCheckoutSettings {
    data {
      vendorName
      audienceOptin
      checkoutDiscounts
      enableSavedPaymentMethods
      statementDescription
      vendorFeatures {
        toggleCardPayments
        wireTransfers
        paypal
        __typename
      }
      defaultCheckoutUrl {
        url
        state
        __typename
      }
      featureFlags {
        defaultCheckoutUrl
        showAliPaySetting
        showIdealSetting
        showGooglePaySetting
        showBancontactSetting
        showSavedPaymentMethodsSetting
        showApplePayDomainVerificationTab
        showPixSetting
        showUpiSetting
        showWeChatSetting
        showMBWaySetting
        showBlikSetting
        showSouthKoreaLocalCardSetting
        showNaverPaySetting
        showKakaoPaySetting
        showSamsungPaySetting
        showPaycoSetting
        __typename
      }
      orderConfirmationEmail {
        freeCheckoutReceipts
        receiptShowMessage
        __typename
      }
      paymentMethods {
        card
        paypal
        wireTransfer
        alipay
        googlePay
        applePay
        ideal
        bancontact
        pix
        upi
        blik
        mbway
        wechat
        southKoreaLocalCard
        naverPay
        kakaoPay
        samsungPay
        payco
        __typename
      }
      __typename
    }
    __typename
  }
}`

export const GET_OVERLAY_SETTINGS_QUERY = `query GetOverlaySettings {
  getOverlaySettings {
    data {
      brandColor
      __typename
    }
    __typename
  }
}`

export const GET_CHECKOUT_STYLES_QUERY = `query GetCheckoutStyles($sellerId: ID) {
  getCheckoutStyles(sellerId: $sellerId) {
    data {
      theme {
        globals {
          activeFocusBorderColor
          activeFocusBoxShadowColor
          borderRadius
          fontFamily
          primaryFontSize
          secondaryFontSize
          useContainerPadding
          maxWidth
          __typename
        }
        inputs {
          text {
            activeColor
            backgroundColor
            borderColor
            borderRadius
            borderWidth
            color
            fontSize
            minHeight
            placeholderColor
            withBoxShadow
            __typename
          }
          checkbox {
            backgroundColor
            borderRadius
            __typename
          }
          select {
            backgroundColor
            borderColor
            borderRadius
            borderWidth
            color
            fontSize
            height
            minHeight
            withBoxShadow
            __typename
          }
          selectFieldWithLabel {
            labelVisible
            labelPosition
            __typename
          }
          inputFieldWithLabel {
            labelVisible
            labelPosition
            __typename
          }
          __typename
        }
        buttons {
          primary {
            activeFocusBorderColor
            activeFocusBoxShadowColor
            borderColor
            borderColorHover
            borderWidth
            color
            colorHover
            backgroundColor
            backgroundColorHover
            borderRadius
            fontSize
            height
            width
            __typename
          }
          secondary {
            activeFocusBorderColor
            activeFocusBoxShadowColor
            borderColor
            borderColorHover
            borderWidth
            color
            colorHover
            backgroundColor
            backgroundColorHover
            borderRadius
            fontSize
            height
            width
            __typename
          }
          __typename
        }
        paddleBar {
          container {
            backgroundColor
            borderColor
            borderRadius
            __typename
          }
          dataSharedAndPaddleAddress {
            fontSize
            __typename
          }
          paddleMerchantOrderProcess {
            fontSize
            __typename
          }
          __typename
        }
        label {
          color
          fontSize
          fontWeight
          __typename
        }
        link {
          color
          colorHover
          fontSize
          __typename
        }
        notification {
          container {
            backgroundColor
            borderColor
            borderRadius
            __typename
          }
          text {
            fontSize
            __typename
          }
          __typename
        }
        __typename
      }
      __typename
    }
    __typename
  }
}`

export const SAVE_CHECKOUT_SETTINGS_MUTATION = `mutation SaveCheckoutSettings($checkoutSettingsObject: CheckoutSettingsObjectInput!) {
  saveCheckoutSettings(checkoutSettingsObject: $checkoutSettingsObject) {
    message
    __typename
  }
}`

export const SAVE_STYLES_MUTATION = `mutation SaveStyles($stylesObject: CheckoutStylesObjectInput!) {
  saveStyles(stylesObject: $stylesObject) {
    message
    __typename
  }
}`

export const SAVE_OVERLAY_SETTINGS_MUTATION = `mutation SaveOverlaySettings($overlaySettingsObject: OverlaySettingsObjectInput!) {
  saveOverlaySettings(overlaySettingsObject: $overlaySettingsObject) {
    message
    __typename
  }
}`

export const GET_SELLER_DOMAINS_QUERY = `query GetSellerDomains {
  getDomainReviews {
    id
    domain
    status
    applePayVerificationStatus
    events {
      type
      time
      __typename
    }
    __typename
  }
}`

export const SUBMIT_DOMAIN_APPROVAL_REQUEST_MUTATION = `mutation SubmitDomainApprovalRequest($domain: String!) {
  submitDomainApprovalRequest(domain: $domain) {
    id
    domain
    status
    applePayVerificationStatus
    events {
      type
      time
      __typename
    }
    __typename
  }
}`
