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
  getAssociatedTokenAddress,
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
    const { amount, asset, beneficiary, pin, exact_output = false } = await req.json();

    if (!amount || !asset || !beneficiary || !pin) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    await connectDB();
    const wallet = await WalletModel.findOne({ address: address.toLowerCase() });
    if (!wallet) return NextResponse.json({ error: "Wallet not found" }, { status: 404 });

    // 1. Verify PIN
    const isPinValid = await bcrypt.compare(pin, wallet.pinHash);
    if (!isPinValid) return NextResponse.json({ error: "Incorrect PIN" }, { status: 401 });

    // 1.5. Pre-flight Balance & Gas Checks
    const config = ASSET_CONFIG[asset];
    if (!config) {
      return NextResponse.json({ error: "Unsupported asset for offramp transaction" }, { status: 400 });
    }

    try {
      if (config.chain === "solana") {
        if (!wallet.addresses.sol) {
          return NextResponse.json({ error: "Solana wallet address not configured" }, { status: 400 });
        }
        const solPubkey = new PublicKey(wallet.addresses.sol);
        const connection = config.connection;

        // Check SOL (native gas) balance
        const lamports = await connection.getBalance(solPubkey);
        const solBalance = lamports / 1e9;
        console.log(`[Offramp Pre-flight] Solana address: ${wallet.addresses.sol}, SOL balance: ${solBalance}`);
        if (solBalance < 0.002) {
          return NextResponse.json({ error: "Insufficient SOL balance for transaction fees (minimum 0.002 SOL required)" }, { status: 400 });
        }

        // Check token (USDC/USDT) balance
        const mintPubkey = new PublicKey(config.mint);
        const ataAddress = await getAssociatedTokenAddress(mintPubkey, solPubkey);
        let tokenBalance = 0;
        try {
          const tokenBalanceRes = await connection.getTokenAccountBalance(ataAddress);
          tokenBalance = tokenBalanceRes.value.uiAmount || 0;
        } catch (err) {
          console.log("[Offramp Pre-flight] No token account or token balance error:", err);
        }
        console.log(`[Offramp Pre-flight] Asset: ${asset}, Token Balance: ${tokenBalance}, Required: ${amount}`);
        if (tokenBalance < Number(amount)) {
          return NextResponse.json({ error: `Insufficient ${asset.split(":")[1].toUpperCase()} balance (available: ${tokenBalance}, required: ${amount})` }, { status: 400 });
        }

      } else if (config.chain === "base") {
        if (!wallet.addresses.base) {
          return NextResponse.json({ error: "Base wallet address not configured" }, { status: 400 });
        }
        const baseAddr = wallet.addresses.base;
        const publicClient = config.publicClient;

        // Check ETH (native gas) balance
        const wei = await publicClient.getBalance({ address: baseAddr as `0x${string}` });
        const ethBalance = Number(wei) / 1e18;
        console.log(`[Offramp Pre-flight] Base address: ${baseAddr}, ETH balance: ${ethBalance}`);
        if (ethBalance < 0.0005) {
          return NextResponse.json({ error: "Insufficient ETH balance on Base for gas fees (minimum 0.0005 ETH required)" }, { status: 400 });
        }

        // Check token (USDC) balance
        const USDC_ABI_BAL = [
          {
            name: "balanceOf",
            type: "function",
            inputs: [{ name: "owner", type: "address" }],
            outputs: [{ name: "", type: "uint256" }]
          }
        ] as const;

        const tokenWei = await publicClient.readContract({
          address: config.address as `0x${string}`,
          abi: USDC_ABI_BAL,
          functionName: "balanceOf",
          args: [baseAddr as `0x${string}`],
        });

        const tokenBalance = Number(tokenWei) / Math.pow(10, config.decimals);
        console.log(`[Offramp Pre-flight] Asset: ${asset}, Token Balance: ${tokenBalance}, Required: ${amount}`);
        if (tokenBalance < Number(amount)) {
          return NextResponse.json({ error: `Insufficient USDC balance on Base (available: ${tokenBalance}, required: ${amount})` }, { status: 400 });
        }
      }
    } catch (checkError: any) {
      console.error("[Offramp Pre-flight Error]", checkError);
      return NextResponse.json({ error: `Pre-flight balance check failed: ${checkError.message}` }, { status: 400 });
    }

    // 2. Initiate Offramp with Switch
    const initiateRes = await SwitchService.initiateOfframp(Number(amount), asset, beneficiary, exact_output);
    if (!initiateRes.success || !initiateRes.data) {
      return NextResponse.json({ error: initiateRes.message || "Switch initiation failed" }, { status: 400 });
    }

    const switchData = initiateRes.data;
    const depositAddress = switchData.deposit.address;
    const depositAmount = switchData.deposit.amount;

    // 3. Create DB Entry
    const rampTx = await RampTransaction.create({
      userId: wallet.userId!,
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

    // 5.5 Confirm Payment with Switch
    try {
      console.log(`[Offramp] Confirming payment with Switch: reference ${switchData.reference}, txHash ${txHash}`);
      const confirmRes = await SwitchService.confirmPayment(switchData.reference, txHash);
      if (confirmRes.success && confirmRes.data) {
        console.log(`[Offramp] Switch confirmed successfully, new status: ${confirmRes.data.status}`);
        rampTx.status = confirmRes.data.status || "PROCESSING";
      } else {
        console.warn("[Offramp] Switch confirm returned unsuccessful status:", confirmRes.message);
        rampTx.status = "PROCESSING";
      }
    } catch (confirmErr: any) {
      console.error("[Offramp] Error calling Switch confirmPayment:", confirmErr);
      rampTx.status = "PROCESSING";
    }

    // 6. Update DB with Hash
    rampTx.tx_hash = txHash;
    await rampTx.save();

    /**
     * sync the transaction status of all pending transactions on the platform
     * Its a fire and forget call, so it doesnt slow down any user's query
     */
    fetch(`${req.nextUrl.origin}/api/wallet/transactions/status`).catch(() => { });

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
