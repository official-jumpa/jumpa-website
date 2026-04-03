import { NextRequest, NextResponse } from "next/server";
import { validateMnemonic } from "@scure/bip39";
import { wordlist } from "@scure/bip39/wordlists/english.js";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { connectDB } from "@/lib/db";
import { encryptMnemonic } from "@/lib/crypto";
import { deriveAddresses } from "@/lib/wallet";
import { Wallet } from "@/models/Wallet";
import { WALLET_PIN_REGEX, WALLET_PIN_ZOD_MESSAGE } from "@/lib/wallet-pin";

const BodySchema = z.object({
  phrase: z.string().min(1, "Phrase is required"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  pin: z.string().regex(WALLET_PIN_REGEX, WALLET_PIN_ZOD_MESSAGE),
});

/**
 * POST /api/wallet?action=create|import
 *
 * action=create  → user confirmed they wrote down the phrase from GET /api/wallet/phrase
 * action=import  → user is providing their own existing phrase
 */
export async function POST(req: NextRequest) {
  const action = req.nextUrl.searchParams.get("action");

  if (action !== "create" && action !== "import") {
    return NextResponse.json(
      { error: "Query param ?action must be 'create' or 'import'" },
      { status: 400 }
    );
  }

  // Parse and validate body
  const body = await req.json().catch(() => null);
  const parsed = BodySchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0].message },
      { status: 400 }
    );
  }

  const { phrase, password, pin } = parsed.data;

  // Validate BIP39 phrase
  if (!validateMnemonic(phrase, wordlist)) {
    return NextResponse.json({ error: "Invalid seed phrase" }, { status: 400 });
  }

  await connectDB();

  // Derive all wallet addresses and public keys from the seed
  let derived: ReturnType<typeof deriveAddresses>;
  try {
    derived = deriveAddresses(phrase);
  } catch {
    return NextResponse.json(
      { error: "Failed to derive wallet addresses" },
      { status: 500 }
    );
  }

  const { addresses, publicKeys } = derived;

  // Use ETH address as the primary wallet identifier
  const address = addresses.eth;

  // Check for duplicate
  const existing = await Wallet.exists({ address });
  if (existing) {
    return NextResponse.json(
      { error: "A wallet with this seed phrase already exists" },
      { status: 409 }
    );
  }

  // Encrypt mnemonic using the PI (required for PIN-based decryption in transfer route)
  const { encryptedMnemonic, iv, salt } = encryptMnemonic(phrase, pin);

  // Hash password and PIN separately
  const [passwordHash, pinHash] = await Promise.all([
    bcrypt.hash(password, 10),
    bcrypt.hash(pin, 10),
  ]);

  // Save to DB
  const wallet = await Wallet.create({
    address,
    addresses,
    publicKeys,
    encryptedMnemonic,
    iv,
    salt,
    passwordHash,
    pinHash,
  });

  return NextResponse.json(
    {
      message: action === "create" ? "Wallet created" : "Wallet imported",
      address: wallet.address,
      addresses: wallet.addresses,
      publicKeys: wallet.publicKeys,
    },
    { status: 201 }
  );
}
