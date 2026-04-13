import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { emailOTP } from "better-auth/plugins";
import { mongoose } from "./db";
import { connectDB } from "./db";
import { sendOtpEmail } from "./email-otp-mail";

await connectDB();
export const auth = betterAuth({

    database: mongodbAdapter(mongoose.connection.db!),
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
        }
    }
});
