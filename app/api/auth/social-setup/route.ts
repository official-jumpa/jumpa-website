import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { generateMnemonic, validateMnemonic } from "@scure/bip39";
import { wordlist } from "@scure/bip39/wordlists/english.js";
import bcrypt from "bcryptjs";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { encryptMnemonic } from "@/lib/crypto";
import { deriveAddresses } from "@/lib/wallet";
import { Wallet } from "@/models/Wallet";

/**
 * POST /api/auth/social-setup
 * 
 * Finalizes social login by generating a wallet for the authenticated user.
 * Requires a 4-digit PIN in the body.
 */
export async function POST(req: NextRequest) {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session) {
        console.error("[SocialSetup] No session found");
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("[SocialSetup] User ID:", session.user.id);

    const { pin } = await req.json().catch(() => ({}));

    if (!pin || !/^\d{4}$/.test(pin)) {
        return NextResponse.json({ error: "Valid 4-digit PIN required" }, { status: 400 });
    }

    await connectDB();

    // Check if user already has a wallet
    const existingWallet = await Wallet.findOne({ userId: session.user.id });
    const allWalletsForUser = await Wallet.find({ userId: session.user.id });
    
    console.log("[SocialSetup] Existing wallet check (findOne):", !!existingWallet);
    console.log("[SocialSetup] Wallets count with this userId:", allWalletsForUser.length);

    if (existingWallet || allWalletsForUser.length > 0) {
        const walletToReturn = existingWallet || allWalletsForUser[0];
        console.log("[SocialSetup] Returning existing wallet for user:", session.user.id);
        return NextResponse.json({ 
            message: "Wallet already exists",
            address: walletToReturn.address,
            addresses: walletToReturn.addresses,
        });
    }

    // Generate fresh 12-word phrase
    const phrase = generateMnemonic(wordlist);
    
    // Derive addresses
    const { addresses, publicKeys } = deriveAddresses(phrase);
    const address = addresses.eth;

    // Encrypt mnemonic with the PIN
    const { encryptedMnemonic, iv, salt } = encryptMnemonic(phrase, pin);

    // Hash the PIN for verification later
    const pinHash = await bcrypt.hash(pin, 10);

    // Save to DB linked to social user
    const wallet = await Wallet.create({
        userId: session.user.id,
        address,
        addresses,
        publicKeys,
        encryptedMnemonic,
        iv,
        salt,
        pinHash,
        passwordHash: "social_login_no_password", // Placeholder for social users
    });

    return NextResponse.json({
        message: "Wallet generated and linked successfully",
        address: wallet.address,
        addresses: wallet.addresses,
    }, { status: 201 });
}
