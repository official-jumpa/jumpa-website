import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Transaction } from "@/models/Transaction";
import RampTransaction from "@/models/RampTransaction";
import { SwitchService } from "@/lib/switch";

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function checkEVMReceipt(rpcUrl: string, hash: string): Promise<"confirmed" | "failed" | "pending"> {
  try {
    const res = await fetch(rpcUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 1,
        method: "eth_getTransactionReceipt",
        params: [hash]
      })
    });
    const data = await res.json();
    if (data.result) {
      return data.result.status === "0x1" ? "confirmed" : "failed";
    }
    return "pending"; // null result means not mined yet
  } catch (err) {
    return "pending";
  }
}

async function checkSolanaReceipt(rpcUrl: string, hash: string): Promise<"confirmed" | "failed" | "pending"> {
  try {
    const res = await fetch(rpcUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 1,
        method: "getTransaction",
        params: [hash, { encoding: "json", maxSupportedTransactionVersion: 0 }]
      })
    });
    const data = await res.json();
    
    // getTransaction returns the tx object in data.result if it exists
    if (data.result) {
      if (data.result.meta && data.result.meta.err !== null) {
        return "failed";
      }
      return "confirmed";
    }
    return "pending"; // null result means not found / pending
  } catch (err) {
    return "pending";
  }
}

export const GET = async () => {
  try {
    await connectDB();

    const results = { cryptoUpdated: 0, rampUpdated: 0 };
    const cutoffTime = new Date(Date.now() - 60000); // 1 minute ago

    // --- 1. Process up to 25 Crypto Transactions ---
    for (let i = 0; i < 25; i++) {
      // Find a pending transaction that hasn't been locked/checked in the last minute
      const tx = await Transaction.findOneAndUpdate(
        { status: "pending", updatedAt: { $lt: cutoffTime } },
        { $set: { updatedAt: new Date() } }, // Lock it by bumping updatedAt
        { returnDocument: "after", sort: { createdAt: 1 } } // Oldest first
      );

      if (!tx) break; // No more pending transactions eligible

      let newStatus: "confirmed" | "failed" | "pending" = "pending";
      
      const chainStr = tx.chain.toLowerCase();
      console.log(`[Sync Crypto] Checking tx ${tx._id} (${tx.hash}) on ${tx.chain}`);

      if (chainStr.includes("sol")) {
        const rpc = chainStr.includes("devnet") ? process.env.ALCHEMY_DEVNET_RPC : process.env.ALCHEMY_MAINNET_RPC;
        if (rpc) newStatus = await checkSolanaReceipt(rpc, tx.hash);
      } else if (chainStr.includes("base")) {
        // Base EVM
        const rpc = process.env.ALCHEMY_BASE_MAINNET_RPC; // For simplicity, we fallback to mainnet if devnet not provided
        if (rpc) newStatus = await checkEVMReceipt(rpc, tx.hash);
      } else if (chainStr.includes("eth")) {
        // ETH EVM - assuming mainnet RPC is ALCHEMY_MAINNET_RPC or standard
        const rpc = process.env.ALCHEMY_MAINNET_RPC || process.env.ALCHEMY_BASE_MAINNET_RPC; 
        if (rpc) newStatus = await checkEVMReceipt(rpc, tx.hash);
      }

      if (newStatus !== "pending") {
        console.log(`[Sync Crypto] Updated tx ${tx._id} to ${newStatus}`);
        await Transaction.updateOne({ _id: tx._id }, { $set: { status: newStatus } });
        results.cryptoUpdated++;
      } else {
        console.log(`[Sync Crypto] Tx ${tx._id} still pending`);
      }
    }

    // --- 2. Process up to 25 Ramp Transactions ---
    for (let i = 0; i < 25; i++) {
      const rampTx = await RampTransaction.findOneAndUpdate(
        { status: { $in: ["AWAITING_DEPOSIT", "PROCESSING"] }, updatedAt: { $lt: cutoffTime } },
        { $set: { updatedAt: new Date() } },
        { returnDocument: "after", sort: { createdAt: 1 } }
      );

      if (!rampTx) break;

      if (rampTx.reference) {
        console.log(`[Sync Ramp] Checking ramp tx ${rampTx._id} (ref: ${rampTx.reference})`);
        const switchRes = await SwitchService.getTransactionStatus(rampTx.reference);
        
        if (switchRes.success && switchRes.data && switchRes.data.status !== rampTx.status) {
          console.log(`[Sync Ramp] Updated ramp tx ${rampTx._id} to ${switchRes.data.status}`);
          await RampTransaction.updateOne(
            { _id: rampTx._id }, 
            { $set: { status: switchRes.data.status, tx_hash: switchRes.data.hash || rampTx.tx_hash } }
          );
          results.rampUpdated++;
        } else {
          console.log(`[Sync Ramp] Ramp tx ${rampTx._id} still ${rampTx.status}`);
        }
        
        // Rate limit protection for Switch API
        await sleep(500);
      }
    }

    return NextResponse.json({ success: true, results });
  } catch (err: any) {
    console.error("[Transaction Sync Error]", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
};
