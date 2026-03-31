import { mnemonicToAccount } from "viem/accounts";

// localStorage keys for wallet storage
const WALLET_ADDRESS_KEY = "jumpa_wallet_address";
const WALLET_ADDRESSES_KEY = "jumpa_wallet_addresses";

export interface DerivedWallet {
  addresses: {
    eth: string;
    btc: string;
    sol: string;
    flow: string;
  };
  publicKeys: {
    eth: string;
    btc: string;
    sol: string;
    flow: string;
  };
}

export interface StoredWallet {
  address: string;
  addresses: {
    eth: string;
    btc: string;
    sol: string;
    flow: string;
  };
}

/**
 * Derives public addresses and raw public keys for ETH, BTC, SOL, and FLOW
 * from a BIP39 mnemonic using viem (for EVM) and standard logic.
 */
export function deriveAddresses(phrase: string): DerivedWallet {
  // Use viem's account derivation for Ethereum and Flow EVM
  const account = mnemonicToAccount(phrase);
  const ethAddress = account.address;

  // For BTC and SOL, we'll keep the placeholders or implement them if needed.
  // Currently, the app focuses on EVM (Flow/Eth).

  return {
    addresses: {
      eth: ethAddress,
      btc: "btc_placeholder",
      sol: "sol_placeholder",
      flow: ethAddress,
    },
    publicKeys: {
      eth: account.publicKey,
      btc: "btc_pub_placeholder",
      sol: "sol_pub_placeholder",
      flow: account.publicKey,
    },
  };
}

/**
 * Saves wallet locally to browser localStorage.
 * The backend session is managed by session cookies.
 */
export function saveWalletLocally(wallet: StoredWallet): void {
  if (typeof window !== "undefined") {
    localStorage.setItem(WALLET_ADDRESS_KEY, wallet.address);
    localStorage.setItem(WALLET_ADDRESSES_KEY, JSON.stringify(wallet.addresses));
    console.log("[WalletStore] Wallet saved locally:", wallet.address);
  }
}

/**
 * Retrieves wallet from browser localStorage.
 */
export function getStoredWallet(): StoredWallet | null {
  if (typeof window === "undefined") {
    return null;
  }

  const address = localStorage.getItem(WALLET_ADDRESS_KEY);
  const addressesRaw = localStorage.getItem(WALLET_ADDRESSES_KEY);

  if (!address || !addressesRaw) {
    console.log("[WalletStore] No wallet found in localStorage");
    return null;
  }

  try {
    const addresses = JSON.parse(addressesRaw) as StoredWallet["addresses"];
    console.log("[WalletStore] Loaded wallet from localStorage:", address);
    return { address, addresses };
  } catch {
    console.error("[WalletStore] Failed to parse stored wallet addresses");
    return null;
  }
}

/**
 * Clears wallet from browser localStorage.
 */
export function clearWalletLocally(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem(WALLET_ADDRESS_KEY);
    localStorage.removeItem(WALLET_ADDRESSES_KEY);
    console.log("[WalletStore] Wallet cleared from localStorage");
  }
}

/**
 * Returns true if a wallet has been set up on this device.
 */
export function hasWallet(): boolean {
  if (typeof window === "undefined") {
    return false;
  }
  return !!localStorage.getItem(WALLET_ADDRESS_KEY);
}
