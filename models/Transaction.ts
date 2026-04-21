import mongoose, { Schema, Document, Model } from "mongoose";

export interface ITransaction extends Document {
  userId: mongoose.Types.ObjectId;
  fromAddress: string;
  toAddress: string;
  amount: string;
  token: string; // ETH, SOL, USDC, USDT
  hash: string;
  status: "pending" | "confirmed" | "failed";
  chain: "eth" | "solana";
  createdAt: Date;
  updatedAt: Date;
}

const TransactionSchema: Schema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
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
    chain: { type: String, enum: ["eth", "solana"], required: true },
  },
  { timestamps: true },
);

TransactionSchema.index({ userId: 1, toAddress: 1, createdAt: -1 });

export const Transaction: Model<ITransaction> =
  mongoose.models.Transaction ||
  mongoose.model<ITransaction>("Transaction", TransactionSchema);
