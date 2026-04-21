import { NextRequest, NextResponse } from "next/server";
import { createPublicClient, createWalletClient, http, parseEther, formatEther } from "viem";
import { base, baseSepolia } from "viem/chains";
import { mnemonicToAccount } from "viem/accounts";
import { Connection, PublicKey, SystemProgram, Transaction as SolTransaction, Keypair as SolKeypair, LAMPORTS_PER_SOL, sendAndConfirmTransaction } from "@solana/web3.js";
import * as StellarSdk from "@stellar/stellar-sdk";
import * as bip39 from "bip39";
import { derivePath } from "ed25519-hd-key";
import { withAuth } from "@/lib/withAuth";
import { Wallet as WalletModel } from "@/models/Wallet";
import { Transaction as TransactionModel } from "@/models/Transaction";
import { decryptMnemonic } from "@/lib/crypto";

const basePublicClient = createPublicClient({ chain: base, transport: http() });
const baseSepoliaPublicClient = createPublicClient({ chain: baseSepolia, transport: http() });

const baseWalletClient = createWalletClient({ chain: base, transport: http() });
const baseSepoliaWalletClient = createWalletClient({ chain: baseSepolia, transport: http() });

const solMainnetConnection = new Connection("https://api.mainnet-beta.solana.com", "confirmed");
const solDevnetConnection = new Connection("https://api.devnet.solana.com", "confirmed");

const stellarPublic = new StellarSdk.Horizon.Server("https://horizon.stellar.org");
const stellarTestnet = new StellarSdk.Horizon.Server("https://horizon-testnet.stellar.org");

export const POST = withAuth(async (req, { address }) => {
  console.log(`[Transfer] Initiating request for address: ${address}`);

  try {
    const body = await req.json();
    const { to, amount, token, pin } = body;

    if (!to || !amount || !token || !pin) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const wallet = await WalletModel.findOne({ address: address.toLowerCase() });
    if (!wallet) return NextResponse.json({ error: "Wallet not found" }, { status: 404 });

    let mnemonic: string;
    try {
      mnemonic = decryptMnemonic(wallet.encryptedMnemonic, wallet.iv, wallet.salt, pin);
    } catch (err: any) {
      return NextResponse.json({ error: "Incorrect PIN" }, { status: 401 });
    }

    const t = token.toUpperCase();
    let hash: string;
    let chainName: string;
    let fromAddr: string;

    // --- Base Transfers ---
    if (t.includes("BASE") || t.includes("SEP")) {
      const isTestnet = t.includes("SEP");
      chainName = isTestnet ? "baseSepolia" : "base";
      const account = mnemonicToAccount(mnemonic as `0x${string}`);
      fromAddr = account.address;
      
      const pClient = isTestnet ? baseSepoliaPublicClient : basePublicClient;
      
      const amountWei = parseEther(amount);
      const balance = await pClient.getBalance({ address: account.address });
      if (balance < amountWei) return NextResponse.json({ error: "Insufficient balance." }, { status: 400 });

      if (isTestnet) {
        hash = await baseSepoliaWalletClient.sendTransaction({
          account,
          to: to as `0x${string}`,
          value: amountWei,
          chain: baseSepolia,
        });
      } else {
        hash = await baseWalletClient.sendTransaction({
          account,
          to: to as `0x${string}`,
          value: amountWei,
          chain: base,
        });
      }

    // --- Solana Transfers ---
    } else if (t.includes("SOL")) {
      const isTestnet = t.includes("DEV");
      chainName = isTestnet ? "solDevnet" : "solana";
      const connection = isTestnet ? solDevnetConnection : solMainnetConnection;
      
      const seed = bip39.mnemonicToSeedSync(mnemonic);
      const solDerived = derivePath("m/44'/501'/0'/0'", seed.toString('hex')).key;
      const solKeypair = SolKeypair.fromSeed(solDerived);
      fromAddr = solKeypair.publicKey.toBase58();

      const toPubkey = new PublicKey(to);
      const lamports = parseFloat(amount) * LAMPORTS_PER_SOL;

      const transaction = new SolTransaction().add(
        SystemProgram.transfer({
          fromPubkey: solKeypair.publicKey,
          toPubkey,
          lamports,
        })
      );
      hash = await sendAndConfirmTransaction(connection, transaction, [solKeypair]);

    // --- Stellar Transfers ---
    } else if (t.includes("XLM")) {
      const isTestnet = t.includes("TEST");
      chainName = isTestnet ? "stellarTestnet" : "stellar";
      const server = isTestnet ? stellarTestnet : stellarPublic;
      const networkPassphrase = isTestnet ? StellarSdk.Networks.TESTNET : StellarSdk.Networks.PUBLIC;
      
      const seed = bip39.mnemonicToSeedSync(mnemonic);
      const stellarDerived = derivePath("m/44'/148'/0'", seed.toString('hex')).key;
      const stellarKeypair = StellarSdk.Keypair.fromRawEd25519Seed(Buffer.from(stellarDerived));
      fromAddr = stellarKeypair.publicKey();

      const sourceAccount = await server.loadAccount(fromAddr);
      const transaction = new StellarSdk.TransactionBuilder(sourceAccount, {
        fee: StellarSdk.BASE_FEE,
        networkPassphrase,
      })
      .addOperation(StellarSdk.Operation.payment({
        destination: to,
        asset: StellarSdk.Asset.native(),
        amount: amount,
      }))
      .setTimeout(30)
      .build();

      transaction.sign(stellarKeypair);
      const response = await server.submitTransaction(transaction);
      hash = response.hash;

    } else {
      return NextResponse.json({ error: "Unsupported token format" }, { status: 400 });
    }

    try {
      await TransactionModel.create({
        userId: wallet.id,
        fromAddress: fromAddr,
        toAddress: to,
        amount,
        token: t,
        hash,
        chain: chainName,
        status: "pending",
      });
    } catch (e: any) {}

    return NextResponse.json({ success: true, hash, message: "Transaction sent successfully" });

  } catch (err: any) {
    console.error("[Transfer Error]", err);
    return NextResponse.json({ error: err.message || "Failed to execute transfer" }, { status: 500 });
  }
});
