import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/withAuth";
import { z } from "zod";
import Anthropic from "@anthropic-ai/sdk";
import { ChatLog } from "@/models/ChatLog";
import { Wallet } from "@/models/Wallet";
import { connectDB } from "@/lib/db";
import { createPublicClient, http, formatEther } from "viem";
import { base, baseSepolia } from "viem/chains";
import { Connection, PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js";
import * as StellarSdk from "@stellar/stellar-sdk";

const BodySchema = z.object({
  prompt: z.string().min(1, "Prompt is required"),
});

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

const baseClient = createPublicClient({ chain: base, transport: http() });
const baseSepoliaClient = createPublicClient({ chain: baseSepolia, transport: http() });
const solMainnetConnection = new Connection("https://api.mainnet-beta.solana.com", "confirmed");
const solDevnetConnection = new Connection("https://api.devnet.solana.com", "confirmed");
const stellarPublic = new StellarSdk.Horizon.Server("https://horizon.stellar.org");
const stellarTestnet = new StellarSdk.Horizon.Server("https://horizon-testnet.stellar.org");

export const POST = withAuth(async (req, { address }) => {
  const body = await req.json().catch(() => null);
  const parsed = BodySchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  const { prompt } = parsed.data;
  await connectDB()

  try {
    const wallet = await Wallet.findOne({ address: address.toLowerCase() });
    if (!wallet) return NextResponse.json({ error: "Wallet not found" }, { status: 404 });

    const { base: baseAddr, sol: solAddr, xlm: xlmAddr } = wallet.addresses;

    // Fetch quick mainnet and testnet balances for context
    const baseBalance = await baseClient.getBalance({ address: baseAddr as `0x${string}` })
      .then(b => formatEther(b)).catch(() => "0.00");
    const baseSepoliaBalance = await baseSepoliaClient.getBalance({ address: baseAddr as `0x${string}` })
      .then(b => formatEther(b)).catch(() => "0.00");

    const solBalance = solAddr ? await solMainnetConnection.getBalance(new PublicKey(solAddr))
      .then(b => (b / LAMPORTS_PER_SOL).toFixed(4)).catch(() => "0.00") : "0.00";
    const solDevBalance = solAddr ? await solDevnetConnection.getBalance(new PublicKey(solAddr))
      .then(b => (b / LAMPORTS_PER_SOL).toFixed(4)).catch(() => "0.00") : "0.00";

    const xlmBalance = xlmAddr ? await stellarPublic.loadAccount(xlmAddr)
      .then(acc => acc.balances.find((b: any) => b.asset_type === "native")?.balance || "0.00").catch(() => "0.00") : "0.00";
    const xlmTestBalance = xlmAddr ? await stellarTestnet.loadAccount(xlmAddr)
      .then(acc => acc.balances.find((b: any) => b.asset_type === "native")?.balance || "0.00").catch(() => "0.00") : "0.00";

    const chatLog = await ChatLog.findOne({ walletAddress: address });
    const history = chatLog?.messages.slice(-10).map(m => ({
      role: m.role,
      content: m.content
    })) || [];

    const systemPrompt = `
      You are 3rike AI, the autonomous finance assistant for Jumpa. 
      Your goal is to parse user prompts into actionable crypto intents for our supported networks (Solana, Base, Stellar).
      
      Current User Main Addresses: 
      - Base: ${baseAddr}
      - Solana: ${solAddr}
      - Stellar: ${xlmAddr}
      Current Time: ${new Date().toISOString()}
      
      LIVE BALANCES:
      - BASE-ETH: ${baseBalance}
      - BASE-ETH (Sepolia): ${baseSepoliaBalance}
      - SOL (Mainnet): ${solBalance}
      - SOL (Devnet): ${solDevBalance}
      - XLM (Public): ${xlmBalance}
      - XLM (Testnet): ${xlmTestBalance}

      IMPORTANT: Use these LIVE BALANCES to answer users' questions. Example: "You have ${solBalance} SOL"

      INTENTS:
      - SEND_FUNDS: Parameters { amount: string, token: string, recipient: string } 
        Valid tokens: SOL, SOL (Dev), ETH-BASE, ETH (Sep), XLM, XLM (Test)
      - ONRAMP_CRYPTO: Parameters { amount: string, token: string, currency: string }
        Valid tokens: solana:usdc, solana:usdt, base:usdc, base:cngn
        Use this intent when the user wants to buy cryptocurrency. If they specify a Naira fiat amount, set currency to "NGN". If they specify an exact crypto amount (e.g. "Buy 20 USDC"), set currency to the token name (e.g. "USDC") and amount to "20".
      - OFFRAMP_CRYPTO: Parameters { amount: string, token: string }
        Valid tokens: solana:usdc, solana:usdt, base:usdc
        Use this intent when the user wants to sell cryptocurrency for Naira (e.g., "I want to convert 20 usdt to naira").
      - CHECK_BALANCE: Parameters {}
      - SWAP_TOKEN: Parameters { fromToken, toToken, fromAmount }
      - CHAT: General conversation.

      SWAP RULES: 
      We ONLY support Swaps for Solana native tokens via Jupiter at this time. 
      If a user asks to swap Base tokens (ETH-BASE) or Stellar tokens (XLM), you MUST respond using the CHAT intent with a message explaining: "Swapping for Base and Stellar is currently unsupported. We only support Solana swaps via Jupiter today." DO NOT return SWAP_TOKEN for non-Solana assets.

      Default to SOL if unclear.
      
      RESPONSE FORMAT (MUST BE VALID JSON):
      {
        "intent": "INTENT_NAME",
        "params": { ... },
        "message": "User-friendly response explaining what you understood or what action is about to happen."
      }

      TONE & STYLE GUIDELINES:
      - Always use the '₦' symbol (e.g. ₦50,000) instead of writing NGN or Naira in full.
      - Be extremely friendly and conversational.
      - If responding to an ONRAMP_CRYPTO intent, mention that they can fully customize and change the amount, network or asset before they confirm the final checkout.
    `;

    let aiResponse;
    if (process.env.ANTHROPIC_API_KEY) {
      const msg = await anthropic.messages.create({
        model: "claude-haiku-4-5", 
        system: systemPrompt + "\nIMPORTANT: Return ONLY the raw JSON object. Do NOT use markdown code blocks or backticks.",
        max_tokens: 1000,
        messages: [
          ...history,
          { role: "user", content: prompt }
        ] as any
      });

      let text = (msg.content[0] as any).text;
      
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      const cleanJsonStr = jsonMatch ? jsonMatch[0] : text;

      try {
        aiResponse = JSON.parse(cleanJsonStr);
      } catch (e) {
        console.error("[AI JSON Parse Error]", e, "Clean JSON Str:", cleanJsonStr);
        aiResponse = {
          intent: "CHAT",
          params: {},
          message: text
        };
      }
    } else {
      aiResponse = {
        intent: "CHAT",
        params: {},
        message: "Anthropic API Key missing."
      };
    }

    if (chatLog) {
      chatLog.messages.push({ role: "user", content: prompt, timestamp: new Date() });
      chatLog.messages.push({ role: "assistant", content: aiResponse.message, timestamp: new Date() });
      await chatLog.save();
    } else {
      await ChatLog.create({
        userId: wallet._id,
        walletAddress: address,
        messages: [
          { role: "user", content: prompt, timestamp: new Date() },
          { role: "assistant", content: aiResponse.message, timestamp: new Date() }
        ]
      });
    }

    return NextResponse.json(aiResponse);

  } catch (err: any) {
    console.error("[AI Engine Error]", err);
    return NextResponse.json({ 
      intent: "CHAT", 
      params: {}, 
      message: "I'm having trouble processing that right now. Try again in a moment!" 
    });
  }
});
