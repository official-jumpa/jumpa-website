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
import { findPaystackBank, validateAccountNumber } from "@/lib/paystack";

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

      SWAP RULES: 
      We ONLY support Swaps for Solana native tokens via Jupiter at this time. 
      If a user asks to swap Base tokens (ETH-BASE) or Stellar tokens (XLM), you MUST respond using the CHAT intent with a message explaining: "Swapping for Base and Stellar is currently unsupported. We only support Solana swaps via Jupiter today." DO NOT return SWAP_TOKEN for non-Solana assets.

      Default to SOL if unclear.
      
      TESTNETS & SUPPORTED TOKEN SYMBOLS:
      We support Mainnet and Testnet environments. Select the appropriate network-specific token symbol based on the user's prompt (e.g. if they mention "devnet", "sepolia", or "testnet"):
      - Solana Mainnet: "SOL", "USDC-SOL", "USDT-SOL"
      - Solana Devnet: "SOL-DEV", "USDC-SOL-DEV"
      - Base Mainnet: "ETH-BASE", "USDC-BASE", "USDT-BASE"
      - Base Sepolia: "ETH-SEP", "USDC-SEP", "USDT-SEP"
      - Stellar Mainnet: "XLM", "USDC-XLM"
      - Stellar Testnet: "XLM-TEST", "USDC-XLM-TEST"

      SUPPORTED INTENTS & THEIR PARAMS:

      1. CHAT - General conversation or questions. No transaction.
         params: {}

      2. SEND_FUNDS - Transfer crypto to a recipient address.
         params: { amount: string, token: string (use the exact supported symbol from the list above), recipient: string }

      3. SWAP_TOKEN - Swap one Solana token for another (Solana only via Jupiter).
         params: { fromToken: string, toToken: string, fromAmount: string }

      4. ONRAMP_CRYPTO - Buy stablecoins with fiat (Naira bank transfer → crypto wallet).
         CRITICAL PARAM RULES:
         - If the user says a NAIRA / NGN amount (e.g. "deposit ₦50,000", "buy crypto with 10000 naira", "add 5k naira"):
             → set currency = "NGN", amount = the naira number (e.g. "50000")
         - If the user says a DOLLAR or STABLECOIN amount (e.g. "deposit $30", "buy 20 USDC", "add 50 usdt", "i want 100 dollars of usdc"):
             → set currency = the stablecoin ticker (e.g. "USDC" or "USDT"), amount = the stablecoin quantity (e.g. "30")
         - token must be a valid asset identifier: "solana:usdc", "solana:usdt", "base:usdc", or "base:cngn"
         - If user says "base wallet" or "base", prefer base: tokens. If "solana wallet" or "solana", prefer solana: tokens.
         params: { amount: string, token: string, currency: string }

      5. OFFRAMP_CRYPTO - Convert stablecoins in the user's wallet to Naira via bank transfer (offramp/withdrawal).
         CRITICAL PARAM RULES:
         - If the user specifies a NAIRA / NGN amount (e.g. "send 2000naira to bank", "withdraw 5k naira"):
             → set currency = "NGN", amount = the naira number (e.g. "2000")
         - If the user specifies a DOLLAR or STABLECOIN amount (e.g. "convert $20 to naira", "offramp 50 USDC"):
             → set currency = the stablecoin ticker (e.g. "USDC" or "USDT"), amount = the stablecoin quantity (e.g. "20")
         - token: must be a valid asset identifier, e.g., "solana:usdc" or "base:usdc". Choose based on user's live balances (if they have base-eth and base balances, base:usdc, otherwise solana:usdc).
         - bankName: extract the destination Nigerian bank name if mentioned (e.g. "opay", "gtbank", "zenith", "kuda")
         - accountNumber: extract the 10-digit destination bank account number if mentioned (e.g. "80808080")
         params: { amount: string, token: string, currency: string, bankName?: string, accountNumber?: string }

      RESPONSE FORMAT (MUST BE VALID JSON):
      {
        "intent": "INTENT_NAME",
        "params": { ... },
        "message": "User-friendly response explaining what you understood or what action is about to happen."
      }

      TONE & STYLE GUIDELINES:
      - Always use the '₦' symbol (e.g. ₦50,000) instead of writing NGN or Naira in full.
      - Be warm, natural, and conversational — like a knowledgeable friend, not a customer service script.
      - Never use emojis. No emoji characters of any kind in any response.
      - Keep responses concise. Avoid filler phrases like "Got it!", "Sure!", "Absolutely!" or "Of course!".
      - If responding to an ONRAMP_CRYPTO or OFFRAMP_CRYPTO intent, briefly confirm what you understood.
      - Advise the user in the assistant's message that they can switch networks or assets directly inside the transaction box. Keep it friendly and concise.
      - If the user asked for a dollar/stablecoin amount, NEVER mention a Naira amount in your message — the system calculates the Naira equivalent automatically from the live rate.
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
        label: "Buy Asset",
        title: "Onramp Transaction",
        sent: aiResponse.params.currency && aiResponse.params.currency !== "NGN"
          ? `Crypto: ${aiResponse.params.amount} ${aiResponse.params.currency}`
          : `Spend: ${aiResponse.params.amount ? "₦" + aiResponse.params.amount : "₦0"}`,
        to: `Receive: ${aiResponse.params.token}`,
        result: "Tap to review or change the amount"
      };
    } else if (aiResponse.intent === "OFFRAMP_CRYPTO") {
      const bankNameInput = aiResponse.params.bankName;
      const accountNumInput = aiResponse.params.accountNumber;
      let resolvedBank = null;
      let resolvedName = "";

      if (bankNameInput && accountNumInput) {
        if (!process.env.PAYSTACK_BEARER_KEY) {
          throw new Error("PAYSTACK_BEARER_KEY environment variable is missing in the configuration");
        }

        resolvedBank = findPaystackBank(bankNameInput);
        if (resolvedBank) {
          const validation = await validateAccountNumber(accountNumInput, resolvedBank.code);
          if (validation && validation.status && validation.data) {
            resolvedName = validation.data.account_name;
          } else {
            return NextResponse.json({ 
              error: `Bank account validation failed: Could not resolve account name for number ${accountNumInput} at ${resolvedBank.name}.` 
            }, { status: 400 });
          }
        } else {
          return NextResponse.json({ 
            error: `Bank verification failed: Could not recognize bank "${bankNameInput}". Please check the spelling.` 
          }, { status: 400 });
        }
      }

      isTransaction = true;
      const fallbackToken = prompt.toLowerCase().includes("base") ? "base:usdc" : "solana:usdc";
      const targetToken = String(aiResponse.params.token || fallbackToken);
      const currency = String(aiResponse.params.currency || "USD");

      transactionParams = {
        type: "offramp",
        amount: String(aiResponse.params.amount || ""),
        token: targetToken,
        currency,
        bankName: resolvedBank ? resolvedBank.name : "",
        bankCode: resolvedBank ? resolvedBank.code : "",
        accountNumber: accountNumInput || "",
        accountName: resolvedName
      };

      const isNgn = currency === "NGN";
      const displaySent = isNgn
        ? `Amount: ₦${Number(aiResponse.params.amount).toLocaleString()}`
        : `Selling: ${aiResponse.params.amount} ${targetToken.split(":")[1]?.toUpperCase()}`;
      
      const bankNameDisplay = resolvedBank ? (resolvedBank as any).name : (bankNameInput || "Bank");
      const displayTo = accountNumInput
        ? `To: ${resolvedName ? resolvedName + " (" + bankNameDisplay + ")" : bankNameDisplay} - ${accountNumInput}`
        : "To: Naira (Bank)";

      transactionDetails = {
        label: "Sell Asset",
        title: "Offramp Transaction",
        sent: displaySent,
        to: displayTo,
        result: accountNumInput ? "Tap to confirm withdrawal" : "Tap to enter bank details and withdraw"
      };

      if (resolvedName && resolvedBank) {
        aiResponse.message = `I have validated your bank details. I can help you withdraw ${isNgn ? "₦" + Number(aiResponse.params.amount).toLocaleString() : aiResponse.params.amount + " USDC"} to ${resolvedName} (${(resolvedBank as any).name} - ${accountNumInput}). Please note that you can switch networks or assets directly inside the transaction box.`;
      }
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
