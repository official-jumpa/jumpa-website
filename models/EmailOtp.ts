import mongoose, { Schema, Document, model, models } from "mongoose";

export interface IEmailOtp extends Document {
  email: string;
  codeHash: string;
  expiresAt: Date;
  createdAt: Date;
}

const EmailOtpSchema = new Schema<IEmailOtp>(
  {
    email: { type: String, required: true, lowercase: true, index: true },
    codeHash: { type: String, required: true },
    expiresAt: { type: Date, required: true, index: true },
  },
  { timestamps: true },
);

EmailOtpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const EmailOtp =
  (models.EmailOtp as mongoose.Model<IEmailOtp>) ??
  model<IEmailOtp>("EmailOtp", EmailOtpSchema);
