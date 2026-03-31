import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/withAuth";
import { z } from "zod";
import { createPublicClient, http, formatEther } from "viem";
import { mainnet } from "viem/chains";
import Anthropic from "@anthropic-ai/sdk";
import { ChatLog } from "@/models/ChatLog";
import { Wallet } from "@/models/Wallet";

const BodySchema = z.object({
  prompt: z.string().min(1, "Prompt is required"),
});

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || "missing-key",
});

/**
 * POST /api/ai/intent
 * Autonomous AI agent powered by Claude.
 * Features: Multi-turn context, Tool-like parsing, and real logic.
 */
export const POST = withAuth(async (req, { address }) => {
  const body = await req.json().catch(() => null);
  const parsed = BodySchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  const { prompt } = parsed.data;

  try {
    const wallet = await Wallet.findOne({ address });
    if (!wallet) return NextResponse.json({ error: "Wallet not found" }, { status: 404 });

    const flowEvmClient = createPublicClient({
      chain: mainnet, // Using mainnet as a placeholder for Viem, but transport is Testnet
      transport: http("https://testnet.evm.nodes.onflow.org"), 
    });

    const flowBalance = await flowEvmClient.getBalance({ address: address as `0x${string}` })
      .then(b => formatEther(b))
      .catch(() => "0.00");

    const chatLog = await ChatLog.findOne({ walletAddress: address });
    const history = chatLog?.messages.slice(-10).map(m => ({
      role: m.role,
      content: m.content
    })) || [];

    const systemPrompt = `
      You are 3rike AI, the autonomous finance assistant for Jumpa. 
      Your goal is to parse user prompts into actionable crypto intents for the Flow EVM network.
      
      Current User Address: ${address}
      Current Time: ${new Date().toISOString()}
      
      LIVE BALANCES:
      - FLOW: ${flowBalance}
      - ETH: 0.00 (Mocked for Demo)

      IMPORTANT: Use these LIVE BALANCES to answer users' questions about how much money they have.
      Example: If they ask "how much flow do i have", you should say "You have ${flowBalance} FLOW on the Flow EVM network."

      INTENTS:
      - SEND_FUNDS: Parameters { amount, token, recipient }
      - CHECK_BALANCE: Parameters {}
      - SWAP_TOKEN: Parameters { fromToken, toToken, fromAmount }
      - CHAT: General conversation.

      TOKENS: ETH, FLOW, USDC, USDT. Default to FLOW if unclear.
      For swaps, usually the user says "Swap FLOW for USDC" -> { fromToken: "FLOW", toToken: "USDC", fromAmount: "X" }.
      
      RESPONSE FORMAT (MUST BE VALID JSON):
      {
        "intent": "INTENT_NAME",
        "params": { ... },
        "message": "User-friendly response explaining what you understood"
      }
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
