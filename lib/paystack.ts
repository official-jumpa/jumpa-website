import { supportedBanks } from "@/lib/constants/banks";

/**
 * Fuzzy match the bank name to find the correct Paystack/Switch bank code and standard bank name.
 */
export function findPaystackBank(bankName: string): { name: string; code: string } | null {
  const searchTerm = bankName.toLowerCase().trim();

  // Exact match first
  const exactMatch = supportedBanks.find(
    (bank) => bank.name.toLowerCase() === searchTerm
  );
  if (exactMatch) return exactMatch;

  // Common abbreviations and aliases
  const aliases: { [key: string]: string } = {
    "gt bank": "Guaranty Trust Bank",
    "gtb": "Guaranty Trust Bank",
    "gtbank": "Guaranty Trust Bank",
    "guaranty": "Guaranty Trust Bank",
    "uba": "United Bank for Africa",
    "fcmb": "First City Monument Bank",
    "first bank": "First Bank of Nigeria",
    "zenith": "Zenith Bank",
    "access": "Access Bank",
    "union": "Union Bank PLC",
    "eco bank": "Ecobank Nigeria",
    "ecobank": "Ecobank Nigeria",
    "fidelity": "Fidelity Bank",
    "stanbic": "Stanbic IBTC Bank",
    "wema": "Wema Bank",
    "polaris": "Polaris Bank",
    "keystone": "Keystone Bank",
    "sterling": "Sterling Bank",
    "providus": "Providus Bank",
    "unity": "Unity Bank PLC",
    "jaiz": "Jaiz Bank",
    "titan": "Titan Bank",
    "moniepoint": "Moniepoint MFB",
    "opay": "OPay Digital Services Limited (OPay)",
    "paycom": "OPay Digital Services Limited (OPay)",
    "kuda": "Kuda Bank",
    "palmpay": "PalmPay",
    "palm pay": "PalmPay",
  };

  const aliasMatch = aliases[searchTerm];
  if (aliasMatch) {
    const bank = supportedBanks.find(
      (b) => b.name.toLowerCase() === aliasMatch.toLowerCase()
    );
    if (bank) return bank;
  }

  // Partial match (contains)
  const partialMatch = supportedBanks.find((bank) =>
    bank.name.toLowerCase().includes(searchTerm)
  );
  if (partialMatch) return partialMatch;

  // Reverse partial match (search term contains bank name)
  const reverseMatch = supportedBanks.find((bank) =>
    searchTerm.includes(bank.name.toLowerCase())
  );
  if (reverseMatch) return reverseMatch;

  return null;
}

/**
 * Resolves bank account details using Paystack API.
 */
export async function validateAccountNumber(accountNumber: string, bankCode: string) {
  const apiKey = process.env.PAYSTACK_BEARER_KEY;
  if (!apiKey) {
    throw new Error("PAYSTACK_BEARER_KEY environment variable is missing in the configuration");
  }

  try {
    const response = await fetch(`https://api.paystack.co/bank/resolve?account_number=${accountNumber}&bank_code=${bankCode}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    });

    const result = await response.json();
    console.log("[Paystack Resolve API] raw response:", result);
    return result;
  } catch (error: any) {
    console.error("[Paystack Resolve API] error:", error);
    return null;
  }
}
