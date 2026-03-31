import { NextResponse } from "next/server";
import { withAuth } from "@/lib/withAuth";
import { ChatLog } from "@/models/ChatLog";
import { connectDB } from "@/lib/db";

/**
 * GET /api/ai/history
 * Fetch the persistent chat history from the database for the current session.
 */
export const GET = withAuth(async (req, { address }) => {
  try {
    await connectDB();
    const chatLog = await ChatLog.findOne({ walletAddress: address });

    if (!chatLog) {
      return NextResponse.json({ messages: [] });
    }
    
    const messages = chatLog.messages.map((m: any, index: number) => ({
      id: `m-${index}-${m.timestamp.getTime()}`,
      role: m.role === 'assistant' ? 'ai' : 'user',
      text: m.content,
      time: m.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })
    }));
    return NextResponse.json({ messages });
  } catch (err: any) {
    console.error("[AI History Error]", err);
    return NextResponse.json({ error: "Failed to fetch chat history" }, { status: 500 });
  }
});
