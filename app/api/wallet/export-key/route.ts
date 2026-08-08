import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { mnemonicToAccount } from "viem/accounts";
import { derivePath } from "ed25519-hd-key";
import * as bip39 from "bip39";
import { Keypair as SolanaKeypair } from "@solana/web3.js";
import { Keypair as StellarKeypair } from "@stellar/stellar-sdk";
import { HDKey } from "@scure/bip32";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { decryptMnemonic } from "@/lib/crypto";
import { Wallet } from "@/models/Wallet";
import { WALLET_PIN_LENGTH, WALLET_PIN_REGEX } from "@/lib/wallet-pin";

/**
 * POST /api/wallet/export-key
 * Body: { address: string, pin: string }
 * Returns decrypted seed phrase and private keys for ETH, SOL, XLM, BTC.
 */
export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const { address, pin, chain = "eth" } = body as {
    address?: string;
    pin?: string;
    chain?: string;
  };

  if (!address) {
    return NextResponse.json({ error: "Wallet address is required" }, { status: 400 });
  }

  if (!pin || !WALLET_PIN_REGEX.test(pin)) {
    return NextResponse.json(
      { error: `Valid ${WALLET_PIN_LENGTH}-digit PIN required` },
      { status: 400 }
    );
  }

  await connectDB();

  const wallet = await Wallet.findOne({
    userId: session.user.id,
    address: address.toLowerCase(),
  });

  if (!wallet) {
    return NextResponse.json({ error: "Wallet not found" }, { status: 404 });
  }

  let phrase: string;
  try {
    phrase = decryptMnemonic(wallet.encryptedMnemonic, wallet.iv, wallet.salt, pin);
  } catch {
    return NextResponse.json({ error: "Incorrect PIN" }, { status: 401 });
  }

  const seed = bip39.mnemonicToSeedSync(phrase);
  const masterKey = HDKey.fromMasterSeed(seed);

  let privateKey = "";
  const selectedChain = chain.toLowerCase();

  if (selectedChain === "eth" || selectedChain === "base") {
    // EVM (Ethereum / Base): m/44'/60'/0'/0/0
    const ethChild = masterKey.derive("m/44'/60'/0'/0/0");
    privateKey = `0x${Buffer.from(ethChild.privateKey!).toString("hex")}`;
  } else if (selectedChain === "sol") {
    // Solana: m/44'/501'/0'/0'
    const solDerived = derivePath("m/44'/501'/0'/0'", seed.toString("hex")).key;
    const solKeypair = SolanaKeypair.fromSeed(solDerived);
    privateKey = Buffer.from(solKeypair.secretKey).toString("hex");
  } else if (selectedChain === "xlm") {
    // Stellar: m/44'/148'/0'
    const stellarDerived = derivePath("m/44'/148'/0'", seed.toString("hex")).key;
    const stellarKeypair = StellarKeypair.fromRawEd25519Seed(Buffer.from(stellarDerived));
    privateKey = stellarKeypair.secret();
  } else if (selectedChain === "btc") {
    // Bitcoin: m/84'/0'/0'/0/0
    const btcChild = masterKey.derive("m/84'/0'/0'/0/0");
    privateKey = Buffer.from(btcChild.privateKey!).toString("hex");
  } else {
    return NextResponse.json({ error: "Unsupported chain" }, { status: 400 });
  }

  return NextResponse.json({
    chain: selectedChain,
    privateKey,
  });
}
