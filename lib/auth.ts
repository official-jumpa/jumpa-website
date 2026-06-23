import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { emailOTP } from "better-auth/plugins";
import { connectDB, getDb } from "./db";
import { sendOtpEmail } from "./email-otp-mail";
import { generateId } from "./schema-ids";

await connectDB();
export const auth = betterAuth({
  database: mongodbAdapter(getDb()),
  // advanced.generateId is supported at runtime but not yet reflected in this
  // version's TypeScript type definitions — cast to any to unblock compilation.
  advanced: {
    generateId: ({ model }: { model: string }) => {
      const map: Record<string, "USER" | "SESS" | "ACCT" | "VRFY"> = {
        user: "USER",
        session: "SESS",
        account: "ACCT",
        verification: "VRFY",
      };
      return generateId(map[model] ?? "USER");
    },
  } as any,
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
  },
  plugins: [
    emailOTP({
      otpLength: 5,
      expiresIn: 600, // 10 minutes
      async sendVerificationOTP({ email, otp, type }) {
        console.log(`[BetterAuth emailOTP] Sending ${type} OTP to ${email}`);
        await sendOtpEmail(email, otp);
      },
    }),
  ],
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60, // 5 minutes
    },
  },
});
