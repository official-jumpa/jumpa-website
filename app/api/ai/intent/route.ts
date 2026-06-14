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
        system: systemPrompt + "\nIMPORTANT: You MUST return ONLY a single JSON object. Do not include any other text, explanations, or markdown code blocks (e.g. no ```json). Start your response with '{' and end with '}'.",
        max_tokens: 1000,
        messages: [
          ...history,
          { role: "user", content: prompt }
        ] as any
      });

      let text = (msg.content[0] as any).text.trim();
      
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          aiResponse = JSON.parse(jsonMatch[0]);
        } catch (e) {
          console.error("[AI JSON Parse Error]", e, "Clean JSON Str:", jsonMatch[0]);
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

    let isTransaction = false;
    let transactionParams: any = undefined;
    let transactionDetails: any = undefined;

    if (aiResponse.intent === "SEND_FUNDS") {
      isTransaction = true;
      transactionParams = {
        type: "transfer",
        amount: String(aiResponse.params.amount || "0"),
        token: String(aiResponse.params.token || "SOL"),
        recipient: String(aiResponse.params.recipient || aiResponse.params.toAddress || "Unknown")
      };
      transactionDetails = {
        label: "Transfer Intent",
        title: "Pending Transfer",
        sent: `Amount: ${aiResponse.params.amount} ${aiResponse.params.token}`,
        to: `Recipient: ${aiResponse.params.recipient}`,
        result: "Tap to confirm and send"
      };
    } else if (aiResponse.intent === "SWAP_TOKEN") {
      isTransaction = true;
      transactionParams = {
        type: "swap",
        fromToken: String(aiResponse.params.fromToken || "SOL"),
        toToken: String(aiResponse.params.toToken || "USDC"),
        fromAmount: String(aiResponse.params.fromAmount || "0")
      };
      transactionDetails = {
        label: "Swap Intent",
        title: "Drafted Swap",
        sent: `From: ${aiResponse.params.fromAmount} ${aiResponse.params.fromToken}`,
        to: `To: ${aiResponse.params.toToken}`,
        result: "Tap to confirm swap"
      };
    } else if (aiResponse.intent === "ONRAMP_CRYPTO") {
      isTransaction = true;
      transactionParams = {
        type: "onramp",
        amount: String(aiResponse.params.amount || ""),
        token: String(aiResponse.params.token || "solana:usdc"),
        currency: String(aiResponse.params.currency || "NGN")
      };
      transactionDetails = {
        label: "Buy Crypto Request",
        title: "Onramp Transaction",
        sent: aiResponse.params.currency && aiResponse.params.currency !== "NGN"
          ? `Crypto: ${aiResponse.params.amount} ${aiResponse.params.currency}`
          : `Spend: ${aiResponse.params.amount ? "₦" + aiResponse.params.amount : "₦0"}`,
        to: `Receive: ${aiResponse.params.token}`,
        result: "Tap to review or change the amount"
      };
    } else if (aiResponse.intent === "OFFRAMP_CRYPTO") {
      isTransaction = true;
      transactionParams = {
        type: "offramp",
        amount: String(aiResponse.params.amount || ""),
        token: String(aiResponse.params.token || "solana:usdc")
      };
      transactionDetails = {
        label: "Sell Crypto Request",
        title: "Offramp Transaction",
        sent: `Selling: ${aiResponse.params.amount} ${aiResponse.params.token.toUpperCase()}`,
        to: "Receive: Naira (Bank)",
        result: "Tap to enter bank details and withdraw"
      };
    }

    const assistantMsg = {
      role: "assistant" as const,
      content: aiResponse.message,
      timestamp: new Date(),
      isTransaction,
      transactionParams,
      transactionDetails
    };

    if (chatLog) {
      chatLog.messages.push({ role: "user" as const, content: prompt, timestamp: new Date() });
      chatLog.messages.push(assistantMsg);
      await chatLog.save();
    } else {
      await ChatLog.create({
        userId: wallet._id,
        walletAddress: address,
        messages: [
          { role: "user" as const, content: prompt, timestamp: new Date() },
          assistantMsg
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
