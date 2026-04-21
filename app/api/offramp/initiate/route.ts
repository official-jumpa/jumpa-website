import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/withAuth";
import { SwitchService } from "@/lib/switch";
import { Wallet as WalletModel } from "@/models/Wallet";
import RampTransaction from "@/models/RampTransaction";
import { connectDB } from "@/lib/db";
import bcrypt from "bcryptjs";
import { decryptMnemonic } from "@/lib/crypto";

// Solana
import { 
  Connection, 
  PublicKey, 
  Keypair as SolKeypair, 
  Transaction as SolTransaction,
  sendAndConfirmTransaction
} from "@solana/web3.js";
import { 
  getOrCreateAssociatedTokenAccount, 
  createTransferInstruction,
  TOKEN_PROGRAM_ID
} from "@solana/spl-token";
import * as bip39 from "bip39";
import { derivePath } from "ed25519-hd-key";

// Base
import { createPublicClient, createWalletClient, http, parseUnits } from "viem";
import { base } from "viem/chains";
import { mnemonicToAccount } from "viem/accounts";

const ASSET_CONFIG: Record<string, any> = {
  "solana:usdc": {
    chain: "solana",
    mint: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
    decimals: 6,
    connection: new Connection("https://api.mainnet-beta.solana.com", "confirmed")
  },
  "solana:usdt": {
    chain: "solana",
    mint: "Es9vMFrzaDCSTMdUiJfwKsM45AsC8uNUn9865B88uCY",
    decimals: 6,
    connection: new Connection("https://api.mainnet-beta.solana.com", "confirmed")
  },
  "base:usdc": {
    chain: "base",
    address: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
    decimals: 6,
    publicClient: createPublicClient({ chain: base, transport: http() }),
    walletClient: createWalletClient({ chain: base, transport: http() })
  }
};

export const POST = withAuth(async (req, { address }) => {
  try {
    const { amount, asset, beneficiary, pin } = await req.json();

    if (!amount || !asset || !beneficiary || !pin) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    await connectDB();
    const wallet = await WalletModel.findOne({ address: address.toLowerCase() });
    if (!wallet) return NextResponse.json({ error: "Wallet not found" }, { status: 404 });

    // 1. Verify PIN
    const isPinValid = await bcrypt.compare(pin, wallet.pinHash);
    if (!isPinValid) return NextResponse.json({ error: "Incorrect PIN" }, { status: 401 });

    // 2. Initiate Offramp with Switch
    const initiateRes = await SwitchService.initiateOfframp(Number(amount), asset, beneficiary);
    if (!initiateRes.success || !initiateRes.data) {
      return NextResponse.json({ error: initiateRes.message || "Switch initiation failed" }, { status: 400 });
    }

    const switchData = initiateRes.data;
    const depositAddress = switchData.deposit.address;
    const depositAmount = switchData.deposit.amount;

    // 3. Create DB Entry
    const rampTx = await RampTransaction.create({
      userId: wallet.id,
      type: "OFFRAMP",
      status: "AWAITING_DEPOSIT",
      reference: switchData.reference,
      asset,
      amount: Number(amount),
      fiat_currency: "NGN",
      fiat_amount: switchData.destination.amount,
      bank_details: beneficiary,
      deposit_address: depositAddress
    });

    // 4. Decrypt Mnemonic for Blockchain Signing
    let mnemonic;
    try {
      mnemonic = decryptMnemonic(wallet.encryptedMnemonic, wallet.iv, wallet.salt, pin);
    } catch (e) {
      return NextResponse.json({ error: "Failed to decrypt wallet" }, { status: 500 });
    }

    // 5. Execute Blockchain Transfer
    let txHash = "";
    const config = ASSET_CONFIG[asset];
    if (!config) throw new Error("Unsupported asset for auto-transfer");

    try {
      if (config.chain === "solana") {
        const seed = bip39.mnemonicToSeedSync(mnemonic);
        const solDerived = derivePath("m/44'/501'/0'/0'", seed.toString('hex')).key;
        const solKeypair = SolKeypair.fromSeed(solDerived);
        
        const connection = config.connection;
        const mintPubkey = new PublicKey(config.mint);
        const recipientPubkey = new PublicKey(depositAddress);

        // Get associated token accounts (Create if they don't exist, though Switch addresses should have them)
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

        const amountRaw = BigInt(Math.floor(depositAmount * Math.pow(10, config.decimals)));

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

        txHash = await sendAndConfirmTransaction(connection, transaction, [solKeypair]);

      } else if (config.chain === "base") {
        const account = mnemonicToAccount(mnemonic as `0x${string}`);
        const amountUnits = parseUnits(String(depositAmount), config.decimals);

        const USDC_ABI = [
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

        txHash = await config.walletClient.writeContract({
          account,
          address: config.address as `0x${string}`,
          abi: USDC_ABI,
          functionName: "transfer",
          args: [depositAddress as `0x${string}`, amountUnits],
        });
      }
    } catch (bcError: any) {
      console.error("[Blockchain Execute Error Full]", bcError);

      let errorMsg = "Blockchain execution failed.";
      const errorName = bcError.name || "";
      const errMsg = (bcError.message || "").toLowerCase();
      
      if (
        errorName.includes("TokenAccountNotFoundError") || 
        errMsg.includes("insufficient lamports") || 
        errMsg.includes("funds") || 
        errMsg.includes("not found")
      ) {
        errorMsg = "Insufficient funds. You need SOL to pay for transaction fees and the asset to sell.";
      } else if (errMsg.includes("user rejected")) {
        errorMsg = "Transaction was rejected.";
      }

      return NextResponse.json({ 
        error: errorMsg,
        switchReference: switchData.reference 
      }, { status: 400 });
    }

    // 6. Update DB with Hash
    rampTx.tx_hash = txHash;
    rampTx.status = "PROCESSING";
    await rampTx.save();

    return NextResponse.json({
      success: true,
      message: "Offramp initiated and crypto transferred",
      txHash,
      reference: switchData.reference
    });

  } catch (error: any) {
    console.error("[Offramp Initiate Error]", error);
    return NextResponse.json({ error: error.message || "Failed to initiate offramp" }, { status: 500 });
  }
});
