import { NextRequest, NextResponse } from "next/server";
import { createPublicClient, createWalletClient, http, parseEther, formatEther, parseUnits } from "viem";
import { base, baseSepolia } from "viem/chains";
import { mnemonicToAccount } from "viem/accounts";
import { Connection, PublicKey, SystemProgram, Transaction as SolTransaction, Keypair as SolKeypair, LAMPORTS_PER_SOL, sendAndConfirmTransaction } from "@solana/web3.js";
import * as StellarSdk from "@stellar/stellar-sdk";
import * as bip39 from "bip39";
import { derivePath } from "ed25519-hd-key";
import {
  getOrCreateAssociatedTokenAccount,
  createTransferInstruction,
  TOKEN_PROGRAM_ID
} from "@solana/spl-token";
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

const TOKENS_CONFIG = {
  "USDC-BASE": {
    chain: "base",
    address: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
    decimals: 6,
    isTestnet: false
  },
  "USDT-BASE": {
    chain: "base",
    address: "0xfde4C96c8593536E31F229EA8f37b2ADa2699bb2",
    decimals: 6,
    isTestnet: false
  },
  "USDC-SEP": {
    chain: "base",
    address: "0x036CbD53842c5426634e7929541eC2318f3dCF7e",
    decimals: 6,
    isTestnet: true
  },
  "USDT-SEP": {
    chain: "base",
    address: "0x323e78f944A9a1FcF3a10efcC5319DBb0bB6e673",
    decimals: 6,
    isTestnet: true
  },
  "USDC-SOL": {
    chain: "solana",
    mint: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
    decimals: 6,
    isTestnet: false
  },
  "USDT-SOL": {
    chain: "solana",
    mint: "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB",
    decimals: 6,
    isTestnet: false
  },
  "USDC-SOL-DEV": {
    chain: "solana",
    mint: "4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU",
    decimals: 6,
    isTestnet: true
  },
  "USDC-XLM": {
    chain: "stellar",
    code: "USDC",
    issuer: "GBBD7DY23W7RLSTQ27ADK33C34tMs6rrss2vtxf44RpBwMsA543c7B6c",
    isTestnet: false
  },
  "USDC-XLM-TEST": {
    chain: "stellar",
    code: "USDC",
    issuer: "GBFDCVPTQCACGEGKY65TT47MM2O2CGCWKIZVNZRA62Q7H66E264TNMIK",
    isTestnet: true
  }
};

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

    const tokenConfig = TOKENS_CONFIG[t as keyof typeof TOKENS_CONFIG] as any;

    if (tokenConfig) {
      if (tokenConfig.chain === "base") {
        chainName = tokenConfig.isTestnet ? "baseSepolia" : "base";
        const account = mnemonicToAccount(mnemonic as `0x${string}`);
        fromAddr = account.address;

        const pClient = tokenConfig.isTestnet ? baseSepoliaPublicClient : basePublicClient;
        const wClient = tokenConfig.isTestnet ? baseSepoliaWalletClient : baseWalletClient;

        const amountUnits = parseUnits(amount, tokenConfig.decimals);

        const ethBalance = await pClient.getBalance({ address: account.address });
        if (ethBalance < parseEther("0.0005")) {
          return NextResponse.json({ error: "Insufficient ETH balance on Base for gas fees (minimum 0.0005 ETH required)." }, { status: 400 });
        }

        const ERC20_ABI = [
          {
            name: "transfer",
            type: "function",
            inputs: [
              { name: "to", type: "address" },
              { name: "value", type: "uint256" }
            ],
            outputs: [{ name: "", type: "boolean" }]
          }
        ] as const;

        hash = await wClient.writeContract({
          account,
          address: tokenConfig.address as `0x${string}`,
          abi: ERC20_ABI,
          functionName: "transfer",
          args: [to as `0x${string}`, amountUnits],
        });

      } else if (tokenConfig.chain === "solana") {
        chainName = tokenConfig.isTestnet ? "solDevnet" : "solana";
        const connection = tokenConfig.isTestnet ? solDevnetConnection : solMainnetConnection;

        const seed = bip39.mnemonicToSeedSync(mnemonic);
        const solDerived = derivePath("m/44'/501'/0'/0'", seed.toString('hex')).key;
        const solKeypair = SolKeypair.fromSeed(solDerived);
        fromAddr = solKeypair.publicKey.toBase58();

        const recipientPubkey = new PublicKey(to);
        const mintPubkey = new PublicKey(tokenConfig.mint);

        const solBalanceLamports = await connection.getBalance(solKeypair.publicKey);
        if (solBalanceLamports < 0.002 * LAMPORTS_PER_SOL) {
          return NextResponse.json({ error: "Insufficient SOL balance for transaction fees (minimum 0.002 SOL required)." }, { status: 400 });
        }

        const sourceATA = await getOrCreateAssociatedTokenAccount(
          connection,
          solKeypair,
          mintPubkey,
          solKeypair.publicKey
        );

        const destATA = await getOrCreateAssociatedTokenAccount(
          connection,
          solKeypair,
          mintPubkey,
          recipientPubkey
        );

        const amountRaw = BigInt(Math.floor(parseFloat(amount) * Math.pow(10, tokenConfig.decimals)));

        const transaction = new SolTransaction().add(
          createTransferInstruction(
            sourceATA.address,
            destATA.address,
            solKeypair.publicKey,
            amountRaw,
            [],
            TOKEN_PROGRAM_ID
          )
        );

        hash = await sendAndConfirmTransaction(connection, transaction, [solKeypair]);

      } else if (tokenConfig.chain === "stellar") {
        chainName = tokenConfig.isTestnet ? "stellarTestnet" : "stellar";
        const server = tokenConfig.isTestnet ? stellarTestnet : stellarPublic;
        const networkPassphrase = tokenConfig.isTestnet ? StellarSdk.Networks.TESTNET : StellarSdk.Networks.PUBLIC;

        const seed = bip39.mnemonicToSeedSync(mnemonic);
        const stellarDerived = derivePath("m/44'/148'/0'", seed.toString('hex')).key;
        const stellarKeypair = StellarSdk.Keypair.fromRawEd25519Seed(Buffer.from(stellarDerived));
        fromAddr = stellarKeypair.publicKey();

        const sourceAccount = await server.loadAccount(fromAddr);
        const stellarAsset = new StellarSdk.Asset(tokenConfig.code, tokenConfig.issuer);

        const transaction = new StellarSdk.TransactionBuilder(sourceAccount, {
          fee: StellarSdk.BASE_FEE,
          networkPassphrase,
        })
          .addOperation(StellarSdk.Operation.payment({
            destination: to,
            asset: stellarAsset,
            amount: amount,
          }))
          .setTimeout(30)
          .build();

        transaction.sign(stellarKeypair);
        const response = await server.submitTransaction(transaction);
        hash = response.hash;
      } else {
        return NextResponse.json({ error: "Unsupported token config chain" }, { status: 400 });
      }

    } else {
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
    }

    try {
      await TransactionModel.create({
        userId: wallet.id,
        fromAddress: fromAddr,
        toAddress: to,
        amount,
        token: t,
        hash,
        chain: chainName as any,
        status: "pending",
      });

      /**
       * sync the transaction status of all pending transactions on the platform
       * Its a fire and forget call, so it doesnt slow down any user's query
       */
      fetch(`${req.nextUrl.origin}/api/wallet/transactions/status`).catch(() => { });
    } catch (e: any) { }

    return NextResponse.json({ success: true, hash, message: "Transaction sent successfully" });

  } catch (err: any) {
    console.error("[Transfer Error]", err);
    let message = err.message || "Failed to execute transfer";
    if (
      message.includes("Attempt to debit an account but found no record of a prior credit") ||
      message.includes("op_underfunded")
    ) {
      message = "Insufficient funds to cover transaction and fee.";
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }
});
