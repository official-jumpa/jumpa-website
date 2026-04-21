import mongoose, { Schema, Document, model, models } from "mongoose";

export interface IWallet extends Document {
  userId: string | null;
  address: string;
  addresses: {
    eth: string;
    btc: string;
    base: string;
    sol: string;
    xlm: string;
  };
  publicKeys: {
    eth: string;
    btc: string;
    base: string;
    sol: string;
    xlm: string;
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
    userId: { type: String, default: null, index: true },
    address: { type: String, required: true, unique: true, lowercase: true },
    addresses: {
      eth: { type: String, required: true },
      btc: { type: String, required: true },
      sol: { type: String, required: true },
      base: { type: String, required: true },
      xlm: { type: String, required: true },
    },
    publicKeys: {
      eth: { type: String, required: true },
      btc: { type: String, required: true },
      sol: { type: String, required: true },
      base: { type: String, required: true },
      xlm: { type: String, required: true },
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
WalletSchema.index({ "addresses.base": 1 });
WalletSchema.index({ "addresses.sol": 1 });

export const Wallet =
  (models.Wallet as mongoose.Model<IWallet>) ??
  model<IWallet>("Wallet", WalletSchema);
