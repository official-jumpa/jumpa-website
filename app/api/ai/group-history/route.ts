import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/withAuth";
import { ChatLog } from "@/models/ChatLog";
import { Wallet } from "@/models/Wallet";
import { connectDB } from "@/lib/db";

/**
 * GET /api/ai/group-history
 * Fetch the single group chat history for the current user's wallet.
 */
export const GET = withAuth(async (req: NextRequest, { address }: { address: string }) => {
  try {
    await connectDB();
    const chatLog = await ChatLog.findOne({ walletAddress: address, type: "group" });

    if (!chatLog) {
      return NextResponse.json({ messages: [] });
    }

    const messages = chatLog.messages.map((m: any, index: number) => ({
      id: `m-${index}-${m.timestamp ? m.timestamp.getTime() : Date.now()}`,
      role: m.role === "assistant" ? "ai" : "user",
      text: m.content,
      time: m.timestamp
        ? m.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: true })
        : "",
      isTransaction: m.isTransaction,
      transactionParams: m.transactionParams,
      transactionDetails: m.transactionDetails,
      imageUrls: m.imageUrls,
      isVoice: m.isVoice,
      isOtherUser: m.isOtherUser,
    }));

    return NextResponse.json({ messages });
  } catch (err: any) {
    console.error("[Group History GET Error]", err);
    return NextResponse.json({ error: "Failed to fetch group chat history" }, { status: 500 });
  }
});

/**
 * PUT /api/ai/group-history
 * Save/sync group chat messages.
 */
export const PUT = withAuth(async (req: NextRequest, { address }: { address: string }) => {
  try {
    await connectDB();
    const body = await req.json();
    const { messages } = body;

    if (!Array.isArray(messages)) {
      return NextResponse.json({ error: "messages array is required" }, { status: 400 });
    }

    const dbMessages = messages.map((m: any) => ({
      role: (m.role === "ai" ? "assistant" : "user") as "assistant" | "user",
      content: m.text || "",
      timestamp: new Date(),
      isTransaction: m.isTransaction || false,
      transactionParams: m.transactionParams,
      transactionDetails: m.transactionDetails,
      imageUrls: m.imageUrls,
      isVoice: m.isVoice || false,
      isOtherUser: m.isOtherUser || false,
    }));

    const chatLog = await ChatLog.findOne({ walletAddress: address, type: "group" });
    if (chatLog) {
      chatLog.messages = dbMessages;
      await chatLog.save();
    } else {
      const wallet = await Wallet.findOne({ address: address.toLowerCase() });
      await ChatLog.create({
        userId: wallet?._id,
        walletAddress: address,
        type: "group",
        title: "Group Chat",
        messages: dbMessages,
      });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("[Group History PUT Error]", err);
    return NextResponse.json({ error: "Failed to save group chat history" }, { status: 500 });
  }
});
