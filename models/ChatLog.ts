import mongoose, { Schema, Document, Model } from "mongoose";

export interface IChatMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export interface IChatLog extends Document {
  userId: mongoose.Types.ObjectId;
  walletAddress: string;
  messages: IChatMessage[];
  createdAt: Date;
  updatedAt: Date;
}

const ChatLogSchema: Schema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "Wallet", required: true },
    walletAddress: { type: String, required: true, index: true },
    messages: [
      {
        role: { type: String, enum: ["user", "assistant"], required: true },
        content: { type: String, required: true },
        timestamp: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true },
);

ChatLogSchema.index({ walletAddress: 1, updatedAt: -1 });

export const ChatLog: Model<IChatLog> =
  mongoose.models.ChatLog || mongoose.model<IChatLog>("ChatLog", ChatLogSchema);
