import { NextRequest, NextResponse } from "next/server";
import { createPublicClient, http, formatEther } from "viem";
import { base, baseSepolia } from "viem/chains";
import { Connection, PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js";
import * as StellarSdk from "@stellar/stellar-sdk";
import { withAuth } from "@/lib/withAuth";
import { Wallet } from "@/models/Wallet";
import { connectDB } from "@/lib/db";

// Base Clients
const baseClient = createPublicClient({
  chain: base,
  transport: http(), 
});
const baseSepoliaClient = createPublicClient({
  chain: baseSepolia,
  transport: http(),
});

// Solana Connections
const solMainnetConnection = new Connection("https://api.mainnet-beta.solana.com", "confirmed");
const solDevnetConnection = new Connection("https://api.devnet.solana.com", "confirmed");

// Stellar Servers
const stellarPublic = new StellarSdk.Horizon.Server("https://horizon.stellar.org");
const stellarTestnet = new StellarSdk.Horizon.Server("https://horizon-testnet.stellar.org");

const balanceCache: Record<string, { timestamp: number, data: any }> = {};
const CACHE_TTL = 35 * 1000;

/**
 * Executes a balance fetch promise generator with a timeout.
 * Catches all synchronous and asynchronous errors and returns the fallback.
 */
async function safeFetchBalance(
  fetchFn: () => Promise<string>,
  label: string,
  fallback: string = "0.00"
): Promise<string> {
  const timeoutMs = 4000;
  try {
    const promise = fetchFn();
    return await Promise.race([
      promise,
      new Promise<string>((_, reject) =>
        setTimeout(() => reject(new Error(`Timeout on ${label}`)), timeoutMs)
      ),
    ]);
  } catch (err) {
    console.error(
      `[Balance API] Connection error / timeout [${label}]:`,
      err instanceof Error ? err.message : err
    );
    return fallback;
  }
}

/**
 * Fetch on-chain balances for all 6 chains given a wallet's address set.
 * Returns the structured result object (addresses, balances, tokens).
 */
async function fetchWalletBalances(addresses: { base: string; sol: string; xlm: string }) {
  const { base: baseAddr, sol: solAddr, xlm: xlmAddr } = addresses;
  console.log(`[Balance API] Querying on-chain balances. Base: ${baseAddr}, Solana: ${solAddr}, Stellar: ${xlmAddr}`);

  // --- Base Balances ---
  const baseBalancePromise = safeFetchBalance(
    () => baseClient.getBalance({ address: baseAddr as `0x${string}` }).then(b => formatEther(b)),
    "Base Mainnet"
  );
  const baseSepoliaPromise = safeFetchBalance(
    () => baseSepoliaClient.getBalance({ address: baseAddr as `0x${string}` }).then(b => formatEther(b)),
    "Base Sepolia"
  );
    
  // --- Solana Balances ---
  const solPromise = solAddr
    ? safeFetchBalance(
        () => solMainnetConnection.getBalance(new PublicKey(solAddr)).then(b => (b / LAMPORTS_PER_SOL).toFixed(4)),
        "Solana Mainnet"
      )
    : Promise.resolve("0.00");
  const solDevPromise = solAddr
    ? safeFetchBalance(
        () => solDevnetConnection.getBalance(new PublicKey(solAddr)).then(b => (b / LAMPORTS_PER_SOL).toFixed(4)),
        "Solana Devnet"
      )
    : Promise.resolve("0.00");

  // --- Stellar Balances ---
  const xlmPromise = xlmAddr
    ? safeFetchBalance(
        () => stellarPublic.loadAccount(xlmAddr).then(acc => acc.balances.find((b: any) => b.asset_type === "native")?.balance || "0.00"),
        "Stellar Mainnet"
      )
    : Promise.resolve("0.00");
  const xlmTestPromise = xlmAddr
    ? safeFetchBalance(
        () => stellarTestnet.loadAccount(xlmAddr).then(acc => acc.balances.find((b: any) => b.asset_type === "native")?.balance || "0.00"),
        "Stellar Testnet"
      )
    : Promise.resolve("0.00");

  const [baseBal, baseSepBal, solBal, solDevBal, xlmBal, xlmTestBal] = await Promise.all([
    baseBalancePromise, baseSepoliaPromise, solPromise, solDevPromise, xlmPromise, xlmTestPromise
  ]);

  console.log(`[Balance API] On-chain query finished. Results: Base: ${baseBal}, Sepolia: ${baseSepBal}, Solana: ${solBal}, Devnet: ${solDevBal}, Stellar: ${xlmBal}, Testnet: ${xlmTestBal}`);

  const tokens = [
    { symbol: "SOL", name: "Solana Mainnet", address: solAddr, balance: solBal, priceUsd: "150.00" },
    { symbol: "SOL (Dev)", name: "Solana Devnet", address: solAddr, balance: solDevBal, priceUsd: "150.00" },
    { symbol: "BASE", name: "Base Mainnet", address: baseAddr, balance: baseBal, priceUsd: "3540.21" },
    { symbol: "ETH (Sep)", name: "Base Sepolia", address: baseAddr, balance: baseSepBal, priceUsd: "3540.21" },
    { symbol: "XLM", name: "Stellar", address: xlmAddr, balance: xlmBal, priceUsd: "0.12" },
    { symbol: "XLM (Test)", name: "Stellar Testnet", address: xlmAddr, balance: xlmTestBal, priceUsd: "0.12" }
  ];

  return {
    address: baseAddr,
    addresses: { base: baseAddr, sol: solAddr, xlm: xlmAddr },
    balances: {
      base: baseBal,
      baseSepolia: baseSepBal,
      sol: solBal,
      solDevnet: solDevBal,
      xlm: xlmBal,
      xlmTestnet: xlmTestBal,
    },
    tokens,
  };
}

/** Compute total USD value from a tokens array */
function computeTotalUsd(tokens: { balance: string; priceUsd: string }[]): string {
  const total = tokens.reduce((sum, t) => {
    const bal = parseFloat(t.balance) || 0;
    const price = parseFloat(t.priceUsd) || 0;
    return sum + bal * price;
  }, 0);
  return total.toFixed(2);
}

export const GET = withAuth(async (req, { address, userId }) => {
  const url = new URL(req.url);
  const query = url.searchParams.get("q");
  console.log(`[Balance API] Request for user: ${userId}, activeAddress: ${address}, query: ${query}`);

  // --- ALL WALLETS SUMMARY (for wallet list modal) ---
  if (query === "all") {
    try {
      await connectDB();
      // Validate userId to ensure we only query wallets owned by the authenticated user
      if (!userId) {
        console.warn("[Balance API] User context missing for query=all");
        return NextResponse.json({ error: "User context missing" }, { status: 400 });
      }

      const wallets = await Wallet.find({ userId });
      console.log(`[Balance API] Query=all: Found ${wallets.length} wallets for user ${userId}`);

      const results = await Promise.all(wallets.map(async (w) => {
        try {
          // Check per-wallet cache
          const now = Date.now();
          const cached = balanceCache[w.address];
          if (cached && (now - cached.timestamp < CACHE_TTL)) {
            console.log(`[Balance API] Cache hit (q=all) for address: ${w.address}`);
            return {
              address: w.address,
              totalUsd: computeTotalUsd(cached.data.tokens),
            };
          }

          console.log(`[Balance API] Cache miss (q=all) for address: ${w.address}. Querying on-chain...`);
          const data = await fetchWalletBalances(w.addresses);
          balanceCache[w.address] = { timestamp: now, data };

          return {
            address: w.address,
            totalUsd: computeTotalUsd(data.tokens),
          };
        } catch (walletErr) {
          console.error(`[Balance API] Failed to fetch balances for wallet ${w.address}:`, walletErr);
          const cached = balanceCache[w.address];
          return {
            address: w.address,
            totalUsd: cached ? computeTotalUsd(cached.data.tokens) : "0.00",
          };
        }
      }));

      return NextResponse.json(results);
    } catch (err) {
      console.error("[Balance] all-wallets error:", err);
      return NextResponse.json({ error: "Failed to fetch wallet balances" }, { status: 500 });
    }
  }

  // --- SINGLE WALLET (existing behavior) ---
  const now = Date.now();
  const cached = balanceCache[address];
  if (cached && (now - cached.timestamp < CACHE_TTL)) {
    console.log(`[Balance API] Cache hit for address: ${address}`);
    return NextResponse.json(cached.data);
  }

  console.log(`[Balance API] Cache miss for address: ${address}. Querying database and on-chain...`);
  try {
    await connectDB();
    const wallet = await Wallet.findOne({ address: address.toLowerCase() });
    
    if (!wallet) {
      console.error(`[Balance API] Wallet not found in database for address: ${address}`);
      return NextResponse.json({ error: "Wallet not found" }, { status: 404 });
    }

    const result = await fetchWalletBalances(wallet.addresses);

    balanceCache[address] = { timestamp: now, data: result };
    console.log(`[Balance API] Balance query successful for address: ${address}`);
    return NextResponse.json(result);
  } catch (err) {
    console.error("[Balance] error:", err);
    return NextResponse.json({ error: "Failed to fetch balances" }, { status: 500 });
  }
});
