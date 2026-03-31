import mongoose, { Schema, Document, model, models } from "mongoose";

export interface IWallet extends Document {
  address: string;
  addresses: {
    eth: string;
    btc: string;
    flow: string;
    sol: string;
  };
  publicKeys: {
    eth: string;
    btc: string;
    flow: string;
    sol: string;
  };
  encryptedMnemonic: string;
  iv: string;
  salt: string;
  passwordHash: string;
  pinHash: string;
  pinAttempts: number;
  pinLockedUntil: Date | null;
  createdAt: Date;
}

const WalletSchema = new Schema<IWallet>(
  {
    address: { type: String, required: true, unique: true, lowercase: true },
    addresses: {
      eth: { type: String, required: true },
      btc: { type: String, required: true },
      sol: { type: String, required: true },
      flow: { type: String, required: true },
    },
    publicKeys: {
      eth: { type: String, required: true },
      btc: { type: String, required: true },
      sol: { type: String, required: true },
      flow: { type: String, required: true },
    },
    encryptedMnemonic: { type: String, required: true },
    iv: { type: String, required: true },
    salt: { type: String, required: true },
    passwordHash: { type: String, required: true },
    pinHash: { type: String, required: true },
    pinAttempts: { type: Number, default: 0 },
    pinLockedUntil: { type: Date, default: null },
  },
  { timestamps: true },
);

WalletSchema.index({ "addresses.eth": 1 });
WalletSchema.index({ "addresses.flow": 1 });

export const Wallet =
  (models.Wallet as mongoose.Model<IWallet>) ??
  model<IWallet>("Wallet", WalletSchema);
