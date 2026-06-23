import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/withAuth";
import { ChatLog } from "@/models/ChatLog";
import { Wallet } from "@/models/Wallet";
import { connectDB } from "@/lib/db";

/**
 * GET /api/ai/history
 * - No params: returns list of all personal sessions (id, title, updatedAt, messageCount)
 * - ?sessionId=...: returns full messages for that specific session
 */
export const GET = withAuth(async (req: NextRequest, { address }: { address: string }) => {
  try {
    await connectDB();
    const sessionId = req.nextUrl.searchParams.get("sessionId");

    if (sessionId) {
      // Return messages for a specific session
      const chatLog = await ChatLog.findOne({ _id: sessionId, walletAddress: address, type: "personal" });
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

      return NextResponse.json({ messages, title: chatLog.title });
    } else {
      // Return session list (most recent first)
      const sessions = await ChatLog.find({ walletAddress: address, type: "personal" })
        .sort({ updatedAt: -1 })
        .select("_id title updatedAt messages")
        .lean();

      const sessionList = sessions.map((s: any) => ({
        sessionId: s._id,
        title: s.title || "New Chat",
        updatedAt: s.updatedAt,
        messageCount: s.messages?.length || 0,
      }));

      return NextResponse.json({ sessions: sessionList });
    }
  } catch (err: any) {
    console.error("[AI History GET Error]", err);
    return NextResponse.json({ error: "Failed to fetch chat history" }, { status: 500 });
  }
});

/**
 * POST /api/ai/history
 * Creates a new personal chat session. Returns { sessionId, title }.
 */
export const POST = withAuth(async (req: NextRequest, { address }: { address: string }) => {
  try {
    await connectDB();
    const wallet = await Wallet.findOne({ address: address.toLowerCase() });
    if (!wallet) {
      return NextResponse.json({ error: "Wallet not found" }, { status: 404 });
    }

    const newSession = await ChatLog.create({
      userId: wallet._id,
      walletAddress: address,
      type: "personal",
      title: "New Chat",
      messages: [],
    });

    return NextResponse.json({ sessionId: newSession._id, title: newSession.title });
  } catch (err: any) {
    console.error("[AI History POST Error]", err);
    return NextResponse.json({ error: "Failed to create chat session" }, { status: 500 });
  }
});

/**
 * PUT /api/ai/history?sessionId=...
 * Save/sync messages for a specific session.
 * Auto-sets session title from the first user message.
 */
export const PUT = withAuth(async (req: NextRequest, { address }: { address: string }) => {
  try {
    await connectDB();
    const sessionId = req.nextUrl.searchParams.get("sessionId");

    if (!sessionId) {
      return NextResponse.json({ error: "sessionId query param is required" }, { status: 400 });
    }

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

    // Derive title from first user message (truncated to 40 chars)
    const firstUserMsg = messages.find((m: any) => m.role === "user" && m.text?.trim());
    const title = firstUserMsg
      ? firstUserMsg.text.trim().slice(0, 40) + (firstUserMsg.text.trim().length > 40 ? "…" : "")
      : "New Chat";

    const chatLog = await ChatLog.findOne({ _id: sessionId, walletAddress: address, type: "personal" });
    if (!chatLog) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    chatLog.messages = dbMessages;
    // Only update title if still default
    if (!chatLog.title || chatLog.title === "New Chat") {
      chatLog.title = title;
    }
    await chatLog.save();

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("[AI History PUT Error]", err);
    return NextResponse.json({ error: "Failed to save chat history" }, { status: 500 });
  }
});
