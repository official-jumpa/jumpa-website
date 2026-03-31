#!/usr/bin/env node
// scripts/update-page-imports.js
const fs = require("fs");
const path = require("path");

const pageUpdates = [
  {
    path: "app/(home)/onboarding/page.tsx",
    component: "Onboarding",
    import: "@/lib/pages/onboarding",
  },
  {
    path: "app/(home)/create-account/page.tsx",
    component: "CreateAccountForm",
    import: "@/lib/pages/home/create-account",
  },
  {
    path: "app/(home)/3rike-ai/page.tsx",
    component: null,
    import: "@/lib/pages/home/3rikeAi",
    file: "index",
  },
  {
    path: "app/(home)/group/page.tsx",
    component: "GroupFlow",
    import: "@/lib/pages/home/group",
  },
  {
    path: "app/(home)/notification/page.tsx",
    component: "DriverNotification",
    import: "@/lib/pages/home/notification",
  },
  {
    path: "app/(home)/investment/page.tsx",
    component: "Investment",
    import: "@/lib/pages/home/investment",
  },
  {
    path: "app/(home)/loan/page.tsx",
    component: "Loan",
    import: "@/lib/pages/home/loan",
  },
  {
    path: "app/(home)/loan/dashboard/page.tsx",
    component: "LoanDashboard",
    import: "@/lib/pages/home/loan/dashboard",
  },
  {
    path: "app/(home)/loan/success/page.tsx",
    component: "LoanRequestSuccess",
    import: "@/lib/pages/home/loan/success",
  },
  {
    path: "app/(home)/loan/notification/page.tsx",
    component: "LoanNotification",
    import: "@/lib/pages/home/loan/notification",
  },
  {
    path: "app/(home)/savings/page.tsx",
    component: "Savings",
    import: "@/lib/pages/home/savings",
  },
  {
    path: "app/(home)/savings/onboarding/page.tsx",
    component: null,
    import: "@/lib/pages/home/savings/onboarding",
    file: "index",
  },
  {
    path: "app/(home)/savings/dashboard/page.tsx",
    component: "SavingsDashboard",
    import: "@/lib/pages/home/savings/dashboard",
  },
  {
    path: "app/(home)/savings/target-form/page.tsx",
    component: null,
    import: "@/lib/pages/home/savings/target-form",
    file: "index",
  },
  {
    path: "app/(home)/savings/target-savings/page.tsx",
    component: null,
    import: "@/lib/pages/home/savings/target-savings",
    file: "index",
  },
  {
    path: "app/(home)/savings/target-summary/page.tsx",
    component: "SavingsSummary",
    import: "@/lib/pages/home/savings/target-summary",
  },
  {
    path: "app/(home)/savings/notification/page.tsx",
    component: null,
    import: "@/lib/pages/home/savings/notification",
    file: "index",
  },
  {
    path: "app/(home)/verification/page.tsx",
    component: "Verification",
    import: "@/lib/pages/home/verification",
  },
  {
    path: "app/(home)/verification/form/page.tsx",
    component: "VerifyAccountForm",
    import: "@/lib/pages/home/verification/form",
  },
  {
    path: "app/(home)/verification/success/page.tsx",
    component: "VerificationSuccess",
    import: "@/lib/pages/home/verification/success",
  },
  {
    path: "app/(home)/verification/fail/page.tsx",
    component: "VerificationFailed",
    import: "@/lib/pages/home/verification/fail",
  },
  {
    path: "app/(home)/verification/verification-failed/page.tsx",
    component: "VerificationFailedForm",
    import: "@/lib/pages/home/verification/verification-failed",
  },
  {
    path: "app/(home)/withdraw/page.tsx",
    component: "Withdraw",
    import: "@/lib/pages/home/withdraw",
  },
  {
    path: "app/(home)/withdraw/options/page.tsx",
    component: null,
    import: "@/lib/pages/home/withdraw/options",
    file: "index",
  },
  {
    path: "app/(home)/withdraw/bank/bank-details/page.tsx",
    component: "WithdrawBankDetails",
    import: "@/lib/pages/home/withdraw/bank/bank-details",
  },
  {
    path: "app/(home)/withdraw/bank/send-money/page.tsx",
    component: "WithdrawSendMoney",
    import: "@/lib/pages/home/withdraw/bank/send-money",
  },
  {
    path: "app/(home)/withdraw/bank/set-pin/page.tsx",
    component: "SetPinWithdraw",
    import: "@/lib/pages/home/withdraw/bank/set-pin",
  },
  {
    path: "app/(home)/withdraw/crypto/select-crypto/page.tsx",
    component: "SelectCryptoAsset",
    import: "@/lib/pages/home/withdraw/crypto/select-crypto",
  },
  {
    path: "app/(home)/withdraw/crypto/withdraw-crypto/page.tsx",
    component: "WithdrawCryptoAsset",
    import: "@/lib/pages/home/withdraw/crypto/withdraw-crypto",
  },
  {
    path: "app/(home)/settings/page.tsx",
    component: null,
    import: "@/lib/pages/home/settings",
    file: "index",
  },
  {
    path: "app/(home)/settings/home/page.tsx",
    component: "SettingsHome",
    import: "@/lib/pages/home/settings/home",
  },
  {
    path: "app/(home)/settings/profile/page.tsx",
    component: "SettingsProfile",
    import: "@/lib/pages/home/settings/profile",
  },
  {
    path: "app/(home)/settings/payment-settings/page.tsx",
    component: "PaymentSettings",
    import: "@/lib/pages/home/settings/payment-settings",
  },
  {
    path: "app/(home)/settings/payment-pin/change-pin/page.tsx",
    component: "ChangePaymentPin",
    import: "@/lib/pages/home/settings/payment-pin/change-pin",
  },
  {
    path: "app/(home)/investment/home/page.tsx",
    component: "InvestmentApp",
    import: "@/lib/pages/home/investment/home",
  },
  {
    path: "app/(auth)/login/page.tsx",
    component: "Login",
    import: "@/lib/pages/auth/login",
  },
  {
    path: "app/(auth)/forgot-password/page.tsx",
    component: "ForgotPassword",
    import: "@/lib/pages/auth/forgot-password",
  },
  {
    path: "app/(auth)/unified/page.tsx",
    component: null,
    import: "@/lib/pages/auth/unified",
    file: "index",
  },
  {
    path: "app/(public)/chat/page.tsx",
    component: "AiChat",
    import: "@/lib/pages/chat",
  },
];

const rootDir = path.join(__dirname, "..");

pageUpdates.forEach(
  ({ path: filePath, component, import: importPath, file }) => {
    const fullPath = path.join(rootDir, filePath);

    if (!fs.existsSync(fullPath)) {
      console.log(`⚠️  File not found: ${filePath}`);
      return;
    }

    const resolvedImport = importPath + (file ? `/${file}` : "");
    const content = component
      ? `'use client';\n\nimport ${component} from '${resolvedImport}';\n\nexport default ${component};\n`
      : `'use client';\n\nimport DefaultExport from '${resolvedImport}';\n\nexport default DefaultExport;\n`;

    fs.writeFileSync(fullPath, content, "utf-8");
    console.log(`✓ Updated: ${filePath}`);
  },
);

console.log("✅ All pages updated!");
