import { NextResponse } from "next/server";
import { Connection, Keypair, VersionedTransaction } from "@solana/web3.js";
import { withAuth } from "@/lib/withAuth";
import { Wallet as WalletModel } from "@/models/Wallet";
import { Transaction as TransactionModel } from "@/models/Transaction";
import { decryptMnemonic } from "@/lib/crypto";
import { connectDB } from "@/lib/db";
import * as bip39 from "bip39";
import { derivePath } from "ed25519-hd-key";

const SOL_MINT = "So11111111111111111111111111111111111111112";
const USDC_MINT = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v";

// We strictly operate on Solana Mainnet via Jupiter V6
const solMainnetConnection = new Connection("https://api.mainnet-beta.solana.com", "confirmed");

export const GET = withAuth(async (req, { address }) => {
  const { searchParams } = new URL(req.url);
  const amount = searchParams.get("amount");
  const from = searchParams.get("from")?.toUpperCase();
  const to = searchParams.get("to")?.toUpperCase();

  if (!amount || !from || !to) {
    return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
  }

  // ‼️ Currently enforcing SOL <-> USDC swaps
  if (!["SOL", "USDC"].includes(from) || !["SOL", "USDC"].includes(to) || from === to) {
     return NextResponse.json({ error: "Unsupported pair. Only SOL/USDC on Solana Mainnet is supported." }, { status: 400 });
  }

  try {
    const fromMint = from === "SOL" ? SOL_MINT : USDC_MINT;
    const toMint = to === "SOL" ? SOL_MINT : USDC_MINT;
    
    // Amount in raw integer. SOL=9 dec, USDC=6 dec
    const decimals = from === "SOL" ? 9 : 6;
    const amountIn = Math.floor(parseFloat(amount) * (10 ** decimals));

    const quoteUrl = `https://api.jup.ag/swap/v1/quote?inputMint=${fromMint}&outputMint=${toMint}&amount=${amountIn}&slippageBps=50`;
    const quoteRes = await fetch(quoteUrl);
    
    if (!quoteRes.ok) {
       return NextResponse.json({ error: "No liquidity found on Jupiter." }, { status: 404 });
    }
    
    const quoteData = await quoteRes.json();
    const outDecimals = to === "SOL" ? 9 : 6;
    const formattedAmountOut = (parseInt(quoteData.outAmount) / (10 ** outDecimals)).toFixed(6);

    return NextResponse.json({
      amountOut: formattedAmountOut,
      workingToken: toMint,
      tokenName: to,
      decimals: outDecimals,
      rawQuote: quoteData 
    });
  } catch (err: any) {
    console.error("[Swap Quote Error]", err);
    return NextResponse.json({ error: "Failed to fetch quotes" }, { status: 500 });
  }
});

export const POST = withAuth(async (req, { address }) => {
  try {
    const body = await req.json();
    const { fromAmount, fromToken, toToken, pin, rawQuote } = body;

    if (!rawQuote || !pin) {
      return NextResponse.json({ error: "Missing quote data or pin" }, { status: 400 });
    }

    await connectDB();
    const wallet = await WalletModel.findOne({ address: address.toLowerCase() });
    if (!wallet) return NextResponse.json({ error: "Wallet not found" }, { status: 404 });

    let mnemonic: string;
    try {
      mnemonic = decryptMnemonic(wallet.encryptedMnemonic, wallet.iv, wallet.salt, pin);
    } catch (err) {
      return NextResponse.json({ error: "Incorrect PIN" }, { status: 401 });
    }
    
    const seed = bip39.mnemonicToSeedSync(mnemonic);
    const solDerived = derivePath("m/44'/501'/0'/0'", seed.toString('hex')).key;
    const solKeypair = Keypair.fromSeed(solDerived);
    const solAddress = solKeypair.publicKey.toBase58();

    // 1. Get serialized transaction from Jupiter API
    const swapReq = await fetch('https://api.jup.ag/swap/v1/swap', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        quoteResponse: rawQuote,
        userPublicKey: solAddress,
        wrapAndUnwrapSol: true,
      })
    });
    
    const { swapTransaction, error } = await swapReq.json();
    if (error) {
       return NextResponse.json({ error: `Jupiter Error: ${error}` }, { status: 400 });
    }

    // 2. Deserialize and Sign
    const swapTransactionBuf = Buffer.from(swapTransaction, 'base64');
    const transaction = VersionedTransaction.deserialize(swapTransactionBuf);
    transaction.sign([solKeypair]);

    // 3. Send to network
    const rawTransaction = transaction.serialize();
    const txid = await solMainnetConnection.sendRawTransaction(rawTransaction, {
      skipPreflight: true,
      maxRetries: 2
    });

    // We do not wait for confirmation here because it can take too long for user UX, 
    // we return the tx hash immediately like most wallets.
    
    // 4. Log to DB
    await TransactionModel.create({
      userId: wallet.id,
      fromAddress: solAddress,
      toAddress: "Jupiter Router",
      amount: fromAmount,
      token: `${fromToken}>${toToken}`,
      hash: txid,
      chain: "solana",
      status: "pending",
    });

    return NextResponse.json({
      success: true,
      hash: txid,
      message: "Swap initiated successfully",
    });

  } catch (err: any) {
    console.error("[Swap Exec Error]", err);
    return NextResponse.json({ error: err.message || "Failed to execute swap" }, { status: 500 });
  }
});
