import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { mongoose } from "./db";
import { connectDB } from "./db";

await connectDB();
export const auth = betterAuth({

    database: mongodbAdapter(mongoose.connection.db!),
    socialProviders: {
        google: {
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        },
    },
    // We'll use the anonymous plugin to handle users who only want a wallet
    // without a social identity, keeping the session management unified.
    plugins: [],
    session: {
        cookieCache: {
            enabled: true,
            maxAge: 5 * 60, // 5 minutes
        }
    }
});
