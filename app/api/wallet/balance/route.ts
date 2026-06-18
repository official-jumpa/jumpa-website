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

const erc20Abi = [
  {
    name: "balanceOf",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "owner", type: "address" }],
    outputs: [{ name: "balance", type: "uint256" }],
  },
] as const;

// Token configurations
const TOKENS_CONFIG = {
  base: {
    usdc: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
    usdt: "0xfde4C96c8593536E31F229EA8f37b2ADa2699bb2",
  },
  baseSepolia: {
    usdc: "0x036CbD53842c5426634e7929541eC2318f3dCF7e",
    usdt: "0x323e78f944A9a1FcF3a10efcC5319DBb0bB6e673",
  },
  solana: {
    usdc: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
    usdt: "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB",
  },
  solDevnet: {
    usdc: "4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU",
    usdt: "", // no standard faucet USDT
  },
  stellar: {
    usdcCode: "USDC",
    usdcIssuer: "GBBD7DY23W7RLSTQ27ADK33C34tMs6rrss2vtxf44RpBwMsA543c7B6c",
  },
  stellarTestnet: {
    usdcCode: "USDC",
    usdcIssuer: "GBFDCVPTQCACGEGKY65TT47MM2O2CGCWKIZVNZRA62Q7H66E264TNMIK",
  },
};

const balanceCache: Record<string, { timestamp: number, data: any }> = {};
const CACHE_TTL = 40 * 1000; //cache balances for 40 seconds

/**
 * Executes a balance fetch promise generator with a timeout.
 * Catches all synchronous and asynchronous errors and returns the fallback.
 */
async function safeFetchBalance<T>(
  fetchFn: () => Promise<T>,
  label: string,
  fallback: T
): Promise<T> {
  const timeoutMs = 4000;
  try {
    const promise = fetchFn();
    return await Promise.race([
      promise,
      new Promise<T>((_, reject) =>
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

  // --- Base Balances (Native) ---
  const baseBalancePromise = safeFetchBalance(
    () => baseClient.getBalance({ address: baseAddr as `0x${string}` }).then(b => formatEther(b)),
    "Base Mainnet",
    "0.00"
  );
  const baseSepoliaPromise = safeFetchBalance(
    () => baseSepoliaClient.getBalance({ address: baseAddr as `0x${string}` }).then(b => formatEther(b)),
    "Base Sepolia",
    "0.00"
  );
    
  // --- Base Balances (Tokens: USDC & USDT) ---
  const baseUsdcPromise = safeFetchBalance(
    () => baseClient.readContract({
      address: TOKENS_CONFIG.base.usdc as `0x${string}`,
      abi: erc20Abi,
      functionName: "balanceOf",
      args: [baseAddr as `0x${string}`],
    }).then(b => (Number(b) / 10 ** 6).toFixed(2)),
    "Base USDC",
    "0.00"
  );
  const baseUsdtPromise = safeFetchBalance(
    () => baseClient.readContract({
      address: TOKENS_CONFIG.base.usdt as `0x${string}`,
      abi: erc20Abi,
      functionName: "balanceOf",
      args: [baseAddr as `0x${string}`],
    }).then(b => (Number(b) / 10 ** 6).toFixed(2)),
    "Base USDT",
    "0.00"
  );
  const baseSepoliaUsdcPromise = safeFetchBalance(
    () => baseSepoliaClient.readContract({
      address: TOKENS_CONFIG.baseSepolia.usdc as `0x${string}`,
      abi: erc20Abi,
      functionName: "balanceOf",
      args: [baseAddr as `0x${string}`],
    }).then(b => (Number(b) / 10 ** 6).toFixed(2)),
    "Base Sepolia USDC",
    "0.00"
  );
  const baseSepoliaUsdtPromise = safeFetchBalance(
    () => baseSepoliaClient.readContract({
      address: TOKENS_CONFIG.baseSepolia.usdt as `0x${string}`,
      abi: erc20Abi,
      functionName: "balanceOf",
      args: [baseAddr as `0x${string}`],
    }).then(b => (Number(b) / 10 ** 6).toFixed(2)),
    "Base Sepolia USDT",
    "0.00"
  );

  // --- Solana Balances (Native) ---
  const solPromise = solAddr
    ? safeFetchBalance(
        () => solMainnetConnection.getBalance(new PublicKey(solAddr)).then(b => (b / LAMPORTS_PER_SOL).toFixed(4)),
        "Solana Mainnet",
        "0.00"
      )
    : Promise.resolve("0.00");
  const solDevPromise = solAddr
    ? safeFetchBalance(
        () => solDevnetConnection.getBalance(new PublicKey(solAddr)).then(b => (b / LAMPORTS_PER_SOL).toFixed(4)),
        "Solana Devnet",
        "0.00"
      )
    : Promise.resolve("0.00");

  // --- Solana Balances (Tokens: USDC & USDT) ---
  const solUsdcPromise = solAddr
    ? safeFetchBalance(
        () => solMainnetConnection.getParsedTokenAccountsByOwner(
          new PublicKey(solAddr),
          { mint: new PublicKey(TOKENS_CONFIG.solana.usdc) }
        ).then(res => res.value[0]?.account.data.parsed.info.tokenAmount.uiAmountString || "0.00"),
        "Solana USDC",
        "0.00"
      )
    : Promise.resolve("0.00");
  const solUsdtPromise = solAddr
    ? safeFetchBalance(
        () => solMainnetConnection.getParsedTokenAccountsByOwner(
          new PublicKey(solAddr),
          { mint: new PublicKey(TOKENS_CONFIG.solana.usdt) }
        ).then(res => res.value[0]?.account.data.parsed.info.tokenAmount.uiAmountString || "0.00"),
        "Solana USDT",
        "0.00"
      )
    : Promise.resolve("0.00");
  const solDevUsdcPromise = solAddr
    ? safeFetchBalance(
        () => solDevnetConnection.getParsedTokenAccountsByOwner(
          new PublicKey(solAddr),
          { mint: new PublicKey(TOKENS_CONFIG.solDevnet.usdc) }
        ).then(res => res.value[0]?.account.data.parsed.info.tokenAmount.uiAmountString || "0.00"),
        "Solana Devnet USDC",
        "0.00"
      )
    : Promise.resolve("0.00");

  // --- Stellar Balances (Native + USDC) ---
  const stellarAccountPromise = xlmAddr
    ? safeFetchBalance(
        () => stellarPublic.loadAccount(xlmAddr).then(acc => {
          const native = acc.balances.find((b: any) => b.asset_type === "native")?.balance || "0.00";
          const usdc = acc.balances.find((b: any) => b.asset_code === TOKENS_CONFIG.stellar.usdcCode && b.asset_issuer === TOKENS_CONFIG.stellar.usdcIssuer)?.balance || "0.00";
          return { native, usdc };
        }).catch(err => {
          if (err?.response?.status === 404 || err?.message?.includes("Not Found")) {
            return { native: "0.00", usdc: "0.00" };
          }
          throw err;
        }),
        "Stellar Mainnet Info",
        { native: "0.00", usdc: "0.00" }
      )
    : Promise.resolve({ native: "0.00", usdc: "0.00" });

  const stellarTestnetAccountPromise = xlmAddr
    ? safeFetchBalance(
        () => stellarTestnet.loadAccount(xlmAddr).then(acc => {
          const native = acc.balances.find((b: any) => b.asset_type === "native")?.balance || "0.00";
          const usdc = acc.balances.find((b: any) => b.asset_code === TOKENS_CONFIG.stellarTestnet.usdcCode && b.asset_issuer === TOKENS_CONFIG.stellarTestnet.usdcIssuer)?.balance || "0.00";
          return { native, usdc };
        }).catch(err => {
          if (err?.response?.status === 404 || err?.message?.includes("Not Found")) {
            return { native: "0.00", usdc: "0.00" };
          }
          throw err;
        }),
        "Stellar Testnet Info",
        { native: "0.00", usdc: "0.00" }
      )
    : Promise.resolve({ native: "0.00", usdc: "0.00" });

  // --- Wait for all queries to finish ---
  const [
    baseBal,
    baseSepBal,
    baseUsdc,
    baseUsdt,
    baseSepUsdc,
    baseSepUsdt,
    solBal,
    solDevBal,
    solUsdc,
    solUsdt,
    solDevUsdc,
    xlmInfo,
    xlmTestInfo
  ] = await Promise.all([
    baseBalancePromise,
    baseSepoliaPromise,
    baseUsdcPromise,
    baseUsdtPromise,
    baseSepoliaUsdcPromise,
    baseSepoliaUsdtPromise,
    solPromise,
    solDevPromise,
    solUsdcPromise,
    solUsdtPromise,
    solDevUsdcPromise,
    stellarAccountPromise,
    stellarTestnetAccountPromise
  ]);

  const xlmBal = xlmInfo.native;
  const xlmUsdc = xlmInfo.usdc;
  const xlmTestBal = xlmTestInfo.native;
  const xlmTestUsdc = xlmTestInfo.usdc;

  console.log(
    `[Balance API] On-chain query finished. Results:\n` +
    `  - Base (Address: ${baseAddr}): ETH: ${baseBal} | USDC: ${baseUsdc} | USDT: ${baseUsdt}\n` +
    `  - Base Sepolia (Address: ${baseAddr}): ETH: ${baseSepBal} | USDC: ${baseSepUsdc} | USDT: ${baseSepUsdt}\n` +
    `  - Solana (Address: ${solAddr}): SOL: ${solBal} | USDC: ${solUsdc} | USDT: ${solUsdt}\n` +
    `  - Solana Devnet (Address: ${solAddr}): SOL: ${solDevBal} | USDC: ${solDevUsdc}\n` +
    `  - Stellar (Address: ${xlmAddr}): XLM: ${xlmBal} | USDC: ${xlmUsdc}\n` +
    `  - Stellar Testnet (Address: ${xlmAddr}): XLM: ${xlmTestBal} | USDC: ${xlmTestUsdc}`
  );

  const tokens = [
    { symbol: "SOL", name: "Solana Mainnet", address: solAddr, balance: solBal, priceUsd: "150.00" },
    { symbol: "SOL-DEV", name: "Solana Devnet", address: solAddr, balance: solDevBal, priceUsd: "150.00" },
    { symbol: "ETH-BASE", name: "Base Mainnet", address: baseAddr, balance: baseBal, priceUsd: "3540.21" },
    { symbol: "ETH-SEP", name: "Base Sepolia", address: baseAddr, balance: baseSepBal, priceUsd: "3540.21" },
    { symbol: "XLM", name: "Stellar", address: xlmAddr, balance: xlmBal, priceUsd: "0.12" },
    { symbol: "XLM-TEST", name: "Stellar Testnet", address: xlmAddr, balance: xlmTestBal, priceUsd: "0.12" },
    
    // Stablecoin Balances
    { symbol: "USDC-SOL", name: "Solana USDC", address: solAddr, balance: solUsdc, priceUsd: "1.00" },
    { symbol: "USDC-SOL-DEV", name: "Solana Devnet USDC", address: solAddr, balance: solDevUsdc, priceUsd: "1.00" },
    { symbol: "USDT-SOL", name: "Solana USDT", address: solAddr, balance: solUsdt, priceUsd: "1.00" },
    { symbol: "USDC-BASE", name: "Base USDC", address: baseAddr, balance: baseUsdc, priceUsd: "1.00" },
    { symbol: "USDC-SEP", name: "Base Sepolia USDC", address: baseAddr, balance: baseSepUsdc, priceUsd: "1.00" },
    { symbol: "USDT-BASE", name: "Base USDT", address: baseAddr, balance: baseUsdt, priceUsd: "1.00" },
    { symbol: "USDT-SEP", name: "Base Sepolia USDT", address: baseAddr, balance: baseSepUsdt, priceUsd: "1.00" },
    { symbol: "USDC-XLM", name: "Stellar USDC", address: xlmAddr, balance: xlmUsdc, priceUsd: "1.00" },
    { symbol: "USDC-XLM-TEST", name: "Stellar Testnet USDC", address: xlmAddr, balance: xlmTestUsdc, priceUsd: "1.00" },
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
      
      baseUsdc,
      baseUsdt,
      baseSepoliaUsdc: baseSepUsdc,
      baseSepoliaUsdt: baseSepUsdt,
      solUsdc,
      solUsdt,
      solDevnetUsdc: solDevUsdc,
      xlmUsdc,
      xlmTestnetUsdc: xlmTestUsdc,
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
