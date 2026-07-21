import { NextRequest, NextResponse } from "next/server";
import { formatEther, formatUnits, erc20Abi } from "viem";
import { Connection, PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js";
import * as StellarSdk from "@stellar/stellar-sdk";
import { withAuth } from "@/lib/withAuth";
import { Wallet } from "@/models/Wallet";
import { connectDB } from "@/lib/db";
import { EVM_CHAINS, EVM_CLIENTS } from "@/lib/evm-chains";

// Solana Connections
const solMainnetConnection = new Connection("https://api.mainnet-beta.solana.com", "confirmed");
const solDevnetConnection = new Connection("https://api.devnet.solana.com", "confirmed");

// Stellar Servers
const stellarPublic = new StellarSdk.Horizon.Server("https://horizon.stellar.org");
const stellarTestnet = new StellarSdk.Horizon.Server("https://horizon-testnet.stellar.org");

const balanceCache: Record<string, { timestamp: number, data: any }> = {};
const CACHE_TTL = 5 * 60 * 1000; // cache balances for 5 minutes

const NATIVE_PRICES: Record<string, string> = {
  BTC: "65000.00",
  ETH: "3540.21",
  BNB: "580.00",
  POL: "0.55",
  CELO: "0.65",
  SOL: "150.00",
  XLM: "0.12",
};

let cachedPrices: Record<string, string> = { ...NATIVE_PRICES };
let pricesLastFetched = 0;
const PRICES_CACHE_TTL = 5 * 60 * 1000; // 5 minutes

async function fetchRealPrices(): Promise<Record<string, string>> {
  const now = Date.now();
  if (now - pricesLastFetched < PRICES_CACHE_TTL) {
    return cachedPrices;
  }

  try {
    const res = await fetch("https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,binancecoin,polygon-ecosystem,celo,solana,stellar&vs_currencies=usd");
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const data = await res.json();
    
    cachedPrices = {
      BTC: data["bitcoin"]?.usd?.toString() || NATIVE_PRICES.BTC,
      ETH: data["ethereum"]?.usd?.toString() || NATIVE_PRICES.ETH,
      BNB: data["binancecoin"]?.usd?.toString() || NATIVE_PRICES.BNB,
      POL: data["polygon-ecosystem"]?.usd?.toString() || NATIVE_PRICES.POL,
      CELO: data["celo"]?.usd?.toString() || NATIVE_PRICES.CELO,
      SOL: data["solana"]?.usd?.toString() || NATIVE_PRICES.SOL,
      XLM: data["stellar"]?.usd?.toString() || NATIVE_PRICES.XLM,
    };
    pricesLastFetched = now;
    console.log("[Balance API] Prices updated successfully from CoinGecko:", cachedPrices);
  } catch (err) {
    console.error("[Balance API] Failed to fetch prices from CoinGecko, using fallback:", err);
  }
  return cachedPrices;
}

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
 * Fetch on-chain balances for all EVM chains, Solana, Stellar, and Bitcoin.
 * Returns the structured result object (addresses, balances, tokens).
 */
async function fetchWalletBalances(addresses: { eth: string; base: string; sol: string; xlm: string; btc: string }) {
  const { eth: ethAddr, sol: solAddr, xlm: xlmAddr, btc: btcAddr } = addresses;
  console.log(`[Balance API] Querying on-chain balances. EVM: ${ethAddr}, Solana: ${solAddr}, Stellar: ${xlmAddr}, BTC: ${btcAddr}`);

  const prices = await fetchRealPrices();

  // --- 1. Query EVM Chains (one multicall per chain, mainnet only) ---
  // Multicall3 is deployed at the same address on every major EVM chain.
  const evmQueries = EVM_CHAINS.filter(c => !c.isTestnet).map(async (chain) => {
    const client = EVM_CLIENTS[chain.id];
    const evmAddress = ethAddr as `0x${string}`;

    // Build a single multicall: [eth_getBalance via multicall, ...token balanceOf]
    // viem's multicall batches all reads into one eth_call to Multicall3.
    const result = await safeFetchBalance(
      async () => {
        // Fetch native balance and token balances in parallel.
        // Kept separate so each call uses a single ABI type — mixing ABIs in one
        // multicall array causes TypeScript to unify all entries to the first ABI.
        const [nativeWei, tokenResults] = await Promise.all([
          client.getBalance({ address: evmAddress }),
          chain.tokens.length > 0
            ? client.multicall({
                allowFailure: true,
                contracts: chain.tokens.map(token => ({
                  address: token.address as `0x${string}`,
                  abi: erc20Abi,
                  functionName: "balanceOf" as const,
                  args: [evmAddress] as [`0x${string}`],
                })),
              })
            : Promise.resolve([] as { status: "success" | "failure"; result?: unknown }[]),
        ]);

        const nativeBal = formatEther(nativeWei);

        const tokenBals = tokenResults.map((res, idx) =>
          res.status === "success"
            ? formatUnits(res.result as bigint, chain.tokens[idx].decimals)
            : "0.00"
        );

        return { nativeBal, tokenBals };
      },
      `${chain.label} multicall`,
      { nativeBal: "0.00", tokenBals: chain.tokens.map(() => "0.00") }
    );

    return {
      chain,
      nativeBal: result.nativeBal,
      tokens: chain.tokens.map((token, idx) => ({
        symbol: token.symbol,
        name: token.name,
        address: token.address,
        balance: result.tokenBals[idx],
        decimals: token.decimals,
      })),
    };
  });

  const evmResults = await Promise.all(evmQueries);

  // --- 2. Solana Balances (Native + Token balances) ---
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

  const solUsdcMint = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v";
  const solUsdtMint = "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB";
  const solDevUsdcMint = "4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU";

  const solUsdcPromise = solAddr
    ? safeFetchBalance(
        () => solMainnetConnection.getParsedTokenAccountsByOwner(
          new PublicKey(solAddr),
          { mint: new PublicKey(solUsdcMint) }
        ).then(res => res.value[0]?.account.data.parsed.info.tokenAmount.uiAmountString || "0.00"),
        "Solana USDC",
        "0.00"
      )
    : Promise.resolve("0.00");
  const solUsdtPromise = solAddr
    ? safeFetchBalance(
        () => solMainnetConnection.getParsedTokenAccountsByOwner(
          new PublicKey(solAddr),
          { mint: new PublicKey(solUsdtMint) }
        ).then(res => res.value[0]?.account.data.parsed.info.tokenAmount.uiAmountString || "0.00"),
        "Solana USDT",
        "0.00"
      )
    : Promise.resolve("0.00");
  const solDevUsdcPromise = solAddr
    ? safeFetchBalance(
        () => solDevnetConnection.getParsedTokenAccountsByOwner(
          new PublicKey(solAddr),
          { mint: new PublicKey(solDevUsdcMint) }
        ).then(res => res.value[0]?.account.data.parsed.info.tokenAmount.uiAmountString || "0.00"),
        "Solana Devnet USDC",
        "0.00"
      )
    : Promise.resolve("0.00");

  // --- 3. Stellar Balances (Native + USDC) ---
  const stellarPublicUsdcCode = "USDC";
  const stellarPublicUsdcIssuer = "GBBD7DY23W7RLSTQ27ADK33C34tMs6rrss2vtxf44RpBwMsA543c7B6c";
  const stellarTestnetUsdcIssuer = "GBFDCVPTQCACGEGKY65TT47MM2O2CGCWKIZVNZRA62Q7H66E264TNMIK";

  const stellarAccountPromise = xlmAddr
    ? safeFetchBalance(
        () => stellarPublic.loadAccount(xlmAddr).then(acc => {
          const native = acc.balances.find((b: any) => b.asset_type === "native")?.balance || "0.00";
          const usdc = acc.balances.find((b: any) => b.asset_code === stellarPublicUsdcCode && b.asset_issuer === stellarPublicUsdcIssuer)?.balance || "0.00";
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
          const usdc = acc.balances.find((b: any) => b.asset_code === stellarPublicUsdcCode && b.asset_issuer === stellarTestnetUsdcIssuer)?.balance || "0.00";
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

  // --- 4. Bitcoin Balances (Alchemy) ---
  const btcPromise = btcAddr
    ? safeFetchBalance(
        async () => {
          const ALCHEMY_KEY = process.env.ALCHEMY_API_KEY || "demo";
          const res = await fetch(`https://bitcoin-mainnet.g.alchemy.com/v2/${ALCHEMY_KEY}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              jsonrpc: "2.0",
              id: 1,
              method: "bb_getaddress",
              params: [btcAddr, { details: "basic" }]
            })
          });
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          const json = await res.json();
          if (json.error) throw new Error(json.error.message);
          
          // bb_getaddress returns balance in Satoshis. 1 BTC = 100,000,000 Satoshis.
          const satoshis = parseInt(json.result.balance || "0", 10);
          return (satoshis / 100000000).toFixed(8);
        },
        "Bitcoin Mainnet",
        "0.00000000"
      )
    : Promise.resolve("0.0000");

  // --- Wait for all queries to finish ---
  const [
    solBal,
    solDevBal,
    solUsdc,
    solUsdt,
    solDevUsdc,
    xlmInfo,
    xlmTestInfo,
    btcBal
  ] = await Promise.all([
    solPromise,
    solDevPromise,
    solUsdcPromise,
    solUsdtPromise,
    solDevUsdcPromise,
    stellarAccountPromise,
    stellarTestnetAccountPromise,
    btcPromise
  ]);

  const xlmBal = xlmInfo.native;
  const xlmUsdc = xlmInfo.usdc;
  const xlmTestBal = xlmTestInfo.native;
  const xlmTestUsdc = xlmTestInfo.usdc;

  // Flatten and build the list of all tokens (flat list kept for backwards-compatibility)
  const tokens: any[] = [
    { symbol: "BTC", name: "Bitcoin", address: btcAddr || "", balance: btcBal, priceUsd: prices.BTC },
    { symbol: "SOL", name: "Solana Mainnet", address: solAddr || "", balance: solBal, priceUsd: prices.SOL },
    { symbol: "SOL-DEV", name: "Solana Devnet", address: solAddr, balance: solDevBal, priceUsd: prices.SOL },
    { symbol: "XLM", name: "Stellar", address: xlmAddr, balance: xlmBal, priceUsd: prices.XLM },
    { symbol: "XLM-TEST", name: "Stellar Testnet", address: xlmAddr, balance: xlmTestBal, priceUsd: prices.XLM },
    { symbol: "USDC-SOL", name: "Solana USDC", address: solAddr, balance: solUsdc, priceUsd: "1.00" },
    { symbol: "USDC-SOL-DEV", name: "Solana Devnet USDC", address: solAddr, balance: solDevUsdc, priceUsd: "1.00" },
    { symbol: "USDT-SOL", name: "Solana USDT", address: solAddr, balance: solUsdt, priceUsd: "1.00" },
    { symbol: "USDC-XLM", name: "Stellar USDC", address: xlmAddr, balance: xlmUsdc, priceUsd: "1.00" },
    { symbol: "USDC-XLM-TEST", name: "Stellar Testnet USDC", address: xlmAddr, balance: xlmTestUsdc, priceUsd: "1.00" },
  ];

  // Dynamically populate tokens and flat balances from EVM chains
  const balances: Record<string, string> = {
    bitcoin: btcBal,
    sol: solBal,
    solDevnet: solDevBal,
    xlm: xlmBal,
    xlmTestnet: xlmTestBal,
    solUsdc,
    solUsdt,
    solDevnetUsdc: solDevUsdc,
    xlmUsdc,
    xlmTestnetUsdc: xlmTestUsdc,
  };

  evmResults.forEach((res) => {
    const mainnetPrice = prices[res.chain.nativeSymbol] || "0.00";
    tokens.push({
      symbol: res.chain.nativeSymbol + "-" + res.chain.id.toUpperCase(),
      name: res.chain.label,
      address: ethAddr,
      balance: res.nativeBal,
      priceUsd: mainnetPrice,
    });

    balances[res.chain.id] = res.nativeBal;

    res.tokens.forEach((token) => {
      tokens.push({
        symbol: token.symbol + "-" + res.chain.id.toUpperCase(),
        name: token.name,
        address: token.address,
        balance: token.balance,
        priceUsd: "1.00",
      });

      // Keep explicit named properties for base & baseSepolia for backwards-compatibility
      if (res.chain.id === "base" || res.chain.id === "baseSepolia") {
        balances[res.chain.id + token.symbol] = token.balance;
      }
    });
  });

  return {
    address: ethAddr,
    addresses: { eth: ethAddr, base: ethAddr, sol: solAddr, xlm: xlmAddr, btc: btcAddr },
    balances,
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
