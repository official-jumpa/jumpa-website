import { mnemonicToAccount } from "viem/accounts";
import * as bip39 from "bip39";
import { derivePath } from "ed25519-hd-key";
import { Keypair as SolanaKeypair } from "@solana/web3.js";
import { Keypair as StellarKeypair } from "@stellar/stellar-sdk";
import * as bitcoin from "bitcoinjs-lib";
import BIP32Factory from "bip32";
import * as tinysecp from "tiny-secp256k1";

const bip32 = BIP32Factory(tinysecp);
// localStorage keys for wallet storage
const WALLET_ADDRESS_KEY = "jumpa_wallet_address";
const WALLET_ADDRESSES_KEY = "jumpa_wallet_addresses";

export interface DerivedWallet {
  addresses: {
    eth: string;
    base: string;
    sol: string;
    xlm: string;
    btc: string;
  };
  publicKeys: {
    eth: string;
    base: string;
    sol: string;
    xlm: string;
    btc: string;
  };
}

export interface StoredWallet {
  address: string;
  addresses: {
    eth: string;
    base: string;
    sol: string;
    xlm: string;
    btc: string;
  };
}

/**
 * Derives public addresses and raw public keys for ETH, SOL, and XLM
 * from a BIP39 mnemonic using viem (for EVM) and standard logic.
 */
export function deriveAddresses(phrase: string): DerivedWallet {
  // Use viem's account derivation for Ethereum and Base EVM
  const account = mnemonicToAccount(phrase);
  const ethAddress = account.address;

  // Derive Ed25519 Master Seed
  const seed = bip39.mnemonicToSeedSync(phrase);
  
  // Solana Derivation m/44'/501'/0'/0'
  const solDerived = derivePath("m/44'/501'/0'/0'", seed.toString('hex')).key;
  const solKeypair = SolanaKeypair.fromSeed(solDerived);
  const solAddress = solKeypair.publicKey.toBase58();

  // Stellar Derivation m/44'/148'/0'
  const stellarDerived = derivePath("m/44'/148'/0'", seed.toString('hex')).key;
  const stellarKeypair = StellarKeypair.fromRawEd25519Seed(Buffer.from(stellarDerived));
  const xlmAddress = stellarKeypair.publicKey();

  // Bitcoin Derivation m/84'/0'/0'/0/0 (Native SegWit)
  const btcRoot = bip32.fromSeed(seed, bitcoin.networks.bitcoin);
  const btcChild = btcRoot.derivePath("m/84'/0'/0'/0/0");
  const { address: btcAddress } = bitcoin.payments.p2wpkh({
    pubkey: btcChild.publicKey,
    network: bitcoin.networks.bitcoin,
  });

  return {
    addresses: {
      eth: ethAddress,
      base: ethAddress,
      sol: solAddress,
      xlm: xlmAddress,
      btc: btcAddress || "",
    },
    publicKeys: {
      eth: account.publicKey,
      base: account.publicKey,
      sol: solKeypair.publicKey.toBase58(),
      xlm: xlmAddress,
      btc: Buffer.from(btcChild.publicKey).toString("hex"),
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
