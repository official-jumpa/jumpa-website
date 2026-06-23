import mongoose, { Schema, Document, Model } from "mongoose";

export interface IChatMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  isTransaction?: boolean;
  transactionParams?: any;
  transactionDetails?: {
    title?: string;
    label: string;
    sent: string;
    to: string;
    result: string;
    isScheduled?: boolean;
  };
  imageUrls?: string[];
  isVoice?: boolean;
  isOtherUser?: boolean;
}

export interface IChatLog extends Document {
  userId: mongoose.Types.ObjectId;
  walletAddress: string;
  type: "personal" | "group";
  title: string;
  messages: IChatMessage[];
  createdAt: Date;
  updatedAt: Date;
}

const ChatLogSchema: Schema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "Wallet", required: true },
    walletAddress: { type: String, required: true, index: true },
    type: { type: String, enum: ["personal", "group"], default: "personal" },
    title: { type: String, default: "New Chat" },
    messages: [
      {
        role: { type: String, enum: ["user", "assistant"], required: true },
        content: { type: String, required: true },
        timestamp: { type: Date, default: Date.now },
        isTransaction: { type: Boolean, default: false },
        transactionParams: { type: Schema.Types.Mixed },
        transactionDetails: {
          title: { type: String },
          label: { type: String },
          sent: { type: String },
          to: { type: String },
          result: { type: String },
          isScheduled: { type: Boolean },
        },
        imageUrls: [{ type: String }],
        isVoice: { type: Boolean, default: false },
        isOtherUser: { type: Boolean, default: false },
      },
    ],
  },
  { timestamps: true },
);

ChatLogSchema.index({ walletAddress: 1, type: 1, updatedAt: -1 });

export const ChatLog: Model<IChatLog> =
  mongoose.models.ChatLog || mongoose.model<IChatLog>("ChatLog", ChatLogSchema);
