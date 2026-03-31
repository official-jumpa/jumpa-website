// Page Route Mappings for Next.js
export const pageComponentMapping = {
  // Home Pages
  "(home)/dashboard": {
    import: "@/lib/pages/home/dashboard",
    component: "JumpaDashboard",
    defaultExport: true,
  },
  "(home)/airtime": {
    import: "@/lib/pages/home/airtime",
    component: "AirtimeFlow",
    defaultExport: true,
  },
  "(home)/send": {
    import: "@/lib/pages/home/send",
    component: "Send",
    defaultExport: true,
  },
  "(home)/onboarding": {
    import: "@/lib/pages/home/onboarding",
    component: "Onboarding",
    defaultExport: true,
  },
  "(home)/create-account": {
    import: "@/lib/pages/home/create-account",
    component: "CreateAccountForm",
    defaultExport: true,
  },
  "(home)/3rike-ai": {
    import: "@/lib/pages/home/3rikeAi",
    component: "ThrikeAi",
    defaultExport: true,
  },
  "(home)/group": {
    import: "@/lib/pages/home/group",
    component: "GroupFlow",
    defaultExport: true,
  },
  "(home)/notification": {
    import: "@/lib/pages/home/notification",
    component: "DriverNotification",
    defaultExport: true,
  },
  "(home)/investment": {
    import: "@/lib/pages/home/investment",
    component: "Investment",
    defaultExport: true,
  },
  "(home)/loan": {
    import: "@/lib/pages/home/loan",
    component: "Loan",
    defaultExport: true,
  },
  "(home)/loan/dashboard": {
    import: "@/lib/pages/home/loan/dashboard",
    component: "LoanDashboard",
    defaultExport: true,
  },
  "(home)/loan/success": {
    import: "@/lib/pages/home/loan/success",
    component: "LoanRequestSuccess",
    defaultExport: true,
  },
  "(home)/loan/notification": {
    import: "@/lib/pages/home/loan/notification",
    component: "LoanNotification",
    defaultExport: true,
  },
  "(home)/savings": {
    import: "@/lib/pages/home/savings",
    component: "Savings",
    defaultExport: true,
  },
  "(home)/savings/onboarding": {
    import: "@/lib/pages/home/savings/onboarding",
    component: "SavingsOnboarding",
    defaultExport: true,
  },
  "(home)/savings/dashboard": {
    import: "@/lib/pages/home/savings/dashboard",
    component: "SavingsDashboard",
    defaultExport: true,
  },
  "(home)/savings/target-form": {
    import: "@/lib/pages/home/savings/target-form",
    component: "SavingsTargetForm",
    defaultExport: true,
  },
  "(home)/savings/target-savings": {
    import: "@/lib/pages/home/savings/target-savings",
    component: "SavingsTargetSavings",
    defaultExport: true,
  },
  "(home)/savings/target-summary": {
    import: "@/lib/pages/home/savings/target-summary",
    component: "SavingsSummary",
    defaultExport: true,
  },
  "(home)/savings/notification": {
    import: "@/lib/pages/home/savings/notification",
    component: "SavingsNotification",
    defaultExport: true,
  },
  "(home)/verification": {
    import: "@/lib/pages/home/verification",
    component: "Verification",
    defaultExport: true,
  },
  "(home)/verification/form": {
    import: "@/lib/pages/home/verification/form",
    component: "VerifyAccountForm",
    defaultExport: true,
  },
  "(home)/verification/success": {
    import: "@/lib/pages/home/verification/success",
    component: "VerificationSuccess",
    defaultExport: true,
  },
  "(home)/verification/fail": {
    import: "@/lib/pages/home/verification/fail",
    component: "VerificationFailed",
    defaultExport: true,
  },
  "(home)/verification/verification-failed": {
    import: "@/lib/pages/home/verification/verification-failed",
    component: "VerificationFailedForm",
    defaultExport: true,
  },
  "(home)/withdraw": {
    import: "@/lib/pages/home/withdraw",
    component: "Withdraw",
    defaultExport: true,
  },
  "(home)/withdraw/options": {
    import: "@/lib/pages/home/withdraw/options",
    component: "WithdrawOptions",
    defaultExport: true,
  },
  "(home)/withdraw/bank/bank-details": {
    import: "@/lib/pages/home/withdraw/bank/bank-details",
    component: "WithdrawBankDetails",
    defaultExport: true,
  },
  "(home)/withdraw/bank/send-money": {
    import: "@/lib/pages/home/withdraw/bank/send-money",
    component: "WithdrawSendMoney",
    defaultExport: true,
  },
  "(home)/withdraw/bank/set-pin": {
    import: "@/lib/pages/home/withdraw/bank/set-pin",
    component: "SetPinWithdraw",
    defaultExport: true,
  },
  "(home)/withdraw/crypto/select-crypto": {
    import: "@/lib/pages/home/withdraw/crypto/select-crypto",
    component: "SelectCryptoAsset",
    defaultExport: true,
  },
  "(home)/withdraw/crypto/withdraw-crypto": {
    import: "@/lib/pages/home/withdraw/crypto/withdraw-crypto",
    component: "WithdrawCryptoAsset",
    defaultExport: true,
  },
  "(home)/settings": {
    import: "@/lib/pages/home/settings",
    component: "Settings",
    defaultExport: true,
  },
  "(home)/settings/home": {
    import: "@/lib/pages/home/settings/home",
    component: "SettingsHome",
    defaultExport: true,
  },
  "(home)/settings/profile": {
    import: "@/lib/pages/home/settings/profile",
    component: "SettingsProfile",
    defaultExport: true,
  },
  "(home)/settings/payment-settings": {
    import: "@/lib/pages/home/settings/payment-settings",
    component: "PaymentSettings",
    defaultExport: true,
  },
  "(home)/settings/payment-pin/change-pin": {
    import: "@/lib/pages/home/settings/payment-pin/change-pin",
    component: "ChangePaymentPin",
    defaultExport: true,
  },
  "(home)/investment/home": {
    import: "@/lib/pages/home/investment/home",
    component: "InvestmentApp",
    defaultExport: true,
  },

  // Auth Pages
  "(auth)/login": {
    import: "@/lib/pages/auth/login",
    component: "Login",
    defaultExport: true,
  },
  "(auth)/forgot-password": {
    import: "@/lib/pages/auth/forgot-password",
    component: "ForgotPassword",
    defaultExport: true,
  },
  "(auth)/unified": {
    import: "@/lib/pages/auth/unified",
    component: "Unified",
    defaultExport: true,
  },

  // Public Pages
  "(public)/chat": {
    import: "@/lib/pages/chat",
    component: "AiChat",
    defaultExport: true,
  },
};
