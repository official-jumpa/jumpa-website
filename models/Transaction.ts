import mongoose, { Schema, Document, Model } from "mongoose";
import { generateId } from "@/lib/schema-ids";

export interface ITransaction {
  _id: string;
  userId: string;
  fromAddress: string;
  toAddress: string;
  amount: string;
  token: string; // ETH, SOL, USDC, USDT
  hash: string;
  status: "pending" | "confirmed" | "failed";
  chain: "eth" | "base" | "baseSepolia" | "solana" | "solDevnet" | "stellar" | "stellarTestnet";
  createdAt: Date;
  updatedAt: Date;
}

const TransactionSchema: Schema = new Schema(
  {
    _id: { type: String, default: () => generateId("TRAN") },
    userId: { type: String, required: true },
    fromAddress: { type: String, required: true },
    toAddress: { type: String, required: true },
    amount: { type: String, required: true },
    token: { type: String, required: true },
    hash: { type: String, required: true, unique: true },
    status: {
      type: String,
      enum: ["pending", "confirmed", "failed"],
      default: "pending",
    },
    chain: {
      type: String,
      enum: ["eth", "base", "baseSepolia", "solana", "solDevnet", "stellar", "stellarTestnet"],
      required: true
    },
  },
  { timestamps: true, _id: false },
);

TransactionSchema.index({ userId: 1, toAddress: 1, createdAt: -1 });

export const Transaction: Model<ITransaction> =
  mongoose.models.Transaction ||
  mongoose.model<ITransaction>("Transaction", TransactionSchema);
