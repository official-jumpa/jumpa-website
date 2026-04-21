import mongoose, { Schema, Document, Model } from "mongoose";

export interface IRampTransaction extends Document {
  userId: string;
  type: "ONRAMP" | "OFFRAMP";
  status: "AWAITING_DEPOSIT" | "PROCESSING" | "COMPLETED" | "FAILED";
  reference?: string;
  asset: string;
  amount: number;
  fiat_currency: string;
  fiat_amount: number;
  bank_details?: {
    bank_name: string;
    account_number: string;
    bank_code: string;
  };
  deposit_address?: string;
  tx_hash?: string;
  createdAt: Date;
  updatedAt: Date;
}

const RampTransactionSchema = new Schema<IRampTransaction>(
  {
    userId: { type: String, required: true },
    type: { type: String, enum: ["ONRAMP", "OFFRAMP"], required: true },
    status: {
      type: String,
      enum: ["AWAITING_DEPOSIT", "PROCESSING", "COMPLETED", "FAILED"],
      required: true,
      default: "AWAITING_DEPOSIT",
    },
    reference: { type: String },
    asset: { type: String, required: true },
    amount: { type: Number, required: true },
    fiat_currency: { type: String, required: true, default: "NGN" },
    fiat_amount: { type: Number, required: true },
    bank_details: {
      bank_name: { type: String },
      account_number: { type: String },
      bank_code: { type: String },
    },
    deposit_address: { type: String },
    tx_hash: { type: String },
  },
  { timestamps: true }
);

const RampTransaction: Model<IRampTransaction> =
  mongoose.models.RampTransaction || mongoose.model<IRampTransaction>("RampTransaction", RampTransactionSchema);

export default RampTransaction;
