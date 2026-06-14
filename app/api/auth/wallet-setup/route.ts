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
import { WALLET_PIN_LENGTH, WALLET_PIN_REGEX } from "@/lib/wallet-pin";

/**
 * POST /api/auth/wallet-setup
 *
 * Unified wallet creation for any authenticated user
 * (email OTP or Google social login).
 *
 * Body:
 *   { pin: string }                         → generates a new seed phrase
 *   { pin: string, phrase: string }          → uses the provided phrase (create/import)
 *   { pin: string, action: "import", phrase: string } → explicit import
 */
export async function POST(req: NextRequest) {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session) {
        console.error("[WalletSetup] No session found");
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("[WalletSetup] User ID:", session.user.id);

    const body = await req.json().catch(() => ({}));
    const { pin, phrase: providedPhrase, action } = body as {
        pin?: string;
        phrase?: string;
        action?: "create" | "import";
    };

    if (!pin || !WALLET_PIN_REGEX.test(pin)) {
        return NextResponse.json(
            { error: `Valid ${WALLET_PIN_LENGTH}-digit PIN required` },
            { status: 400 },
        );
    }

    await connectDB();

    // Enforce 5 wallet limit per user
    const existingWallets = await Wallet.find({ userId: session.user.id });
    if (existingWallets.length >= 5) {
        return NextResponse.json(
            { error: "Maximum limit of 5 wallets reached" },
            { status: 400 }
        );
    }

    // Determine default sequential name (Wallet 1, Wallet 2...)
    const existingNames = existingWallets.map(w => w.name);
    let walletIndex = 1;
    while (existingNames.includes(`Wallet ${walletIndex}`)) {
        walletIndex++;
    }
    const walletName = `Wallet ${walletIndex}`;

    // Determine which phrase to use
    let phrase: string;
    if (providedPhrase) {
        // Validate user-provided phrase
        if (!validateMnemonic(providedPhrase, wordlist)) {
            return NextResponse.json({ error: "Invalid seed phrase" }, { status: 400 });
        }
        phrase = providedPhrase;
    } else {
        // Generate a new 12-word phrase
        phrase = generateMnemonic(wordlist);
    }

    // Derive addresses
    const { addresses, publicKeys } = deriveAddresses(phrase);
    const address = addresses.eth;

    // Check for duplicate address
    const duplicateWallet = await Wallet.findOne({ address: address.toLowerCase() });
    if (duplicateWallet) {
        return NextResponse.json(
            { error: "A wallet with this seed phrase already exists" },
            { status: 409 },
        );
    }

    // Encrypt mnemonic with the PIN
    const { encryptedMnemonic, iv, salt } = encryptMnemonic(phrase, pin);

    // Hash the PIN for verification later
    const pinHash = await bcrypt.hash(pin, 10);

    // Save to DB linked to BetterAuth user
    const wallet = await Wallet.create({
        userId: session.user.id,
        name: walletName,
        address,
        addresses,
        publicKeys,
        encryptedMnemonic,
        iv,
        salt,
        pinHash,
        passwordHash: "betterauth_session_no_password",
    });

    console.log(
        "[WalletSetup] Wallet created for user:",
        session.user.id,
        "name:",
        wallet.name,
        "address:",
        wallet.address,
        "action:",
        action ?? (providedPhrase ? "create" : "auto-generate"),
    );

    const response = NextResponse.json({
        message: action === "import" ? "Wallet imported" : "Wallet created",
        address: wallet.address,
        addresses: wallet.addresses,
    }, { status: 201 });

    response.cookies.set("selected_wallet_address", wallet.address, {
        path: "/",
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
    });

    return response;
}
