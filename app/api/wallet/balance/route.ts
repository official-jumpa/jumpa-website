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

export const GET = withAuth(async (req, { address }) => {
  // Check cache
  const now = Date.now();
  const cached = balanceCache[address];
  if (cached && (now - cached.timestamp < CACHE_TTL)) {
    return NextResponse.json(cached.data);
  }

  try {
    await connectDB();
    const wallet = await Wallet.findOne({ address: address.toLowerCase() });
    
    if (!wallet) return NextResponse.json({ error: "Wallet not found" }, { status: 404 });
    const { base: baseAddr, sol: solAddr, xlm: xlmAddr } = wallet.addresses;

    // --- Base Balances ---
    const baseBalancePromise = baseClient.getBalance({ address: baseAddr as `0x${string}` })
      .then(b => formatEther(b)).catch(() => "0.00");
    const baseSepoliaPromise = baseSepoliaClient.getBalance({ address: baseAddr as `0x${string}` })
      .then(b => formatEther(b)).catch(() => "0.00");
      
    // --- Solana Balances ---
    const solPromise = solAddr ? solMainnetConnection.getBalance(new PublicKey(solAddr))
      .then(b => (b / LAMPORTS_PER_SOL).toFixed(4)).catch(() => "0.00") : Promise.resolve("0.00");
    const solDevPromise = solAddr ? solDevnetConnection.getBalance(new PublicKey(solAddr))
      .then(b => (b / LAMPORTS_PER_SOL).toFixed(4)).catch(() => "0.00") : Promise.resolve("0.00");

    // --- Stellar Balances ---
    const xlmPromise = xlmAddr ? stellarPublic.loadAccount(xlmAddr)
      .then(acc => acc.balances.find((b: any) => b.asset_type === "native")?.balance || "0.00").catch(() => "0.00") : Promise.resolve("0.00");
    const xlmTestPromise = xlmAddr ? stellarTestnet.loadAccount(xlmAddr)
      .then(acc => acc.balances.find((b: any) => b.asset_type === "native")?.balance || "0.00").catch(() => "0.00") : Promise.resolve("0.00");

    const [baseBal, baseSepBal, solBal, solDevBal, xlmBal, xlmTestBal] = await Promise.all([
      baseBalancePromise, baseSepoliaPromise, solPromise, solDevPromise, xlmPromise, xlmTestPromise
    ]);

    const result = {
      address: baseAddr,
      addresses: wallet.addresses,
      balances: {
        base: baseBal,
        baseSepolia: baseSepBal,
        sol: solBal,
        solDevnet: solDevBal,
        xlm: xlmBal,
        xlmTestnet: xlmTestBal,
      },
      tokens: [
        { symbol: "SOL", name: "Solana Mainnet", address: solAddr, balance: solBal, priceUsd: "150.00" },
        { symbol: "SOL (Dev)", name: "Solana Devnet", address: solAddr, balance: solDevBal, priceUsd: "150.00" },
        { symbol: "ETH-BASE", name: "Base Mainnet", address: baseAddr, balance: baseBal, priceUsd: "3540.21" },
        { symbol: "ETH (Sep)", name: "Base Sepolia", address: baseAddr, balance: baseSepBal, priceUsd: "3540.21" },
        { symbol: "XLM", name: "Stellar", address: xlmAddr, balance: xlmBal, priceUsd: "0.12" },
        { symbol: "XLM (Test)", name: "Stellar Testnet", address: xlmAddr, balance: xlmTestBal, priceUsd: "0.12" }
      ]
    };

    balanceCache[address] = { timestamp: now, data: result };
    return NextResponse.json(result);
  } catch (err) {
    console.error("[Balance] error:", err);
    return NextResponse.json({ error: "Failed to fetch balances" }, { status: 500 });
  }
});
