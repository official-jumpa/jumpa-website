import { NextResponse } from "next/server";
import { generateMnemonic } from "@scure/bip39";
import { wordlist } from "@scure/bip39/wordlists/english.js";

/**
 * GET /api/wallet/phrase
 * Returns a fresh 12-word BIP39 mnemonic.
 * Nothing is saved — the user must confirm they've written it down
 * before calling POST /api/wallet?action=create.
 */
export async function GET() {
  // 128 bits of entropy → 12 words (standard for most wallets)
  const phrase = generateMnemonic(wordlist, 128);
  return NextResponse.json({ phrase });
}
