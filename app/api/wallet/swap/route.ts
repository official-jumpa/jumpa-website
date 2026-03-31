import { NextResponse } from "next/server";
import { createPublicClient, createWalletClient, http, parseEther, formatEther, formatUnits, defineChain, parseUnits } from "viem";
import { mnemonicToAccount } from "viem/accounts";
import { withAuth } from "@/lib/withAuth";
import { Wallet as WalletModel } from "@/models/Wallet";
import { Transaction as TransactionModel } from "@/models/Transaction";
import { decryptMnemonic } from "@/lib/crypto";
import { connectDB } from "@/lib/db";

const flowTestnet = defineChain({
  id: 545,
  name: 'Flow EVM Testnet',
  network: 'flow-testnet',
  nativeCurrency: { decimals: 18, name: 'Flow', symbol: 'FLOW' },
  rpcUrls: {
    default: { http: ['https://testnet.evm.nodes.onflow.org'] },
    public: { http: ['https://testnet.evm.nodes.onflow.org'] },
  },
  blockExplorers: {
    default: { name: 'FlowScan', url: 'https://evm-testnet.flowscan.io' },
  },
  testnet: true,
});

/**
 * PUNCH SWAP V2 (Flow EVM Testnet)
 */
const ROUTER_ADDRESS = "0xeD53235cC3E9d2d464E9c408B95948836648870B";
const WFLOW_ADDRESS = "0xd3bF53DAC106A0290B0483EcBC89d40FcC961f3e";

const TESTNET_TOKENS = [
  { name: "MockUSDC", address: "0xd431955D55a99EF69BEb96BA34718d0f9fBc91b1", decimals: 6 },
  { name: "mUSDC", address: "0x4154d5B0E2931a0A1E5b733f19161aa7D2fc4b95", decimals: 6 },
  { name: "USDC.e", address: "0x9B7550D337bBB449b89C6f9C926C3b976b6f4095b", decimals: 6 },
  { name: "ETHf", address: "0x059A77239daFa770977DD9f1E98632C3E4559848", decimals: 18 },
  { name: "BTCf", address: "0x208d09d2a6Dd176e3e95b3F0DE172A7471C5B2d6", decimals: 8 },
  { name: "PYUSD0", address: "0xd7d43ab7b365f0d0789aE83F4385fA710FfdC98F", decimals: 6 },
  { name: "MOET", address: "0x51f5cc5f50afb81e8f23c926080fa38c3024b238", decimals: 18 },
];

const DEFAULT_TOKEN = TESTNET_TOKENS[0];

// Minimal Standard Router ABI (V2)
const ROUTER_ABI = [
  {
    name: "swapExactETHForTokens",
    type: "function",
    stateMutability: "payable",
    inputs: [
      { name: "amountOutMin", type: "uint256" },
      { name: "path", type: "address[]" },
      { name: "to", type: "address" },
      { name: "deadline", type: "uint256" },
    ],
    outputs: [{ name: "amounts", type: "uint256[]" }],
  },
  {
    name: "swapExactTokensForETH",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "amountIn", type: "uint256" },
      { name: "amountOutMin", type: "uint256" },
      { name: "path", type: "address[]" },
      { name: "to", type: "address" },
      { name: "deadline", type: "uint256" },
    ],
    outputs: [{ name: "amounts", type: "uint256[]" }],
  },
  {
    name: "getAmountsOut",
    type: "function",
    stateMutability: "view",
    inputs: [
      { name: "amountIn", type: "uint256" },
      { name: "path", type: "address[]" },
    ],
    outputs: [{ name: "amounts", type: "uint256[]" }],
  },
] as const;

const ERC20_ABI = [
  {
    name: "approve",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "spender", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [{ name: "", type: "boolean" }],
  },
] as const;

/**
 * GET /api/wallet/swap?amount=1&from=FLOW&to=USDC
 * Fetches a real-time quote from PunchSwap.
 * Probes multiple USDC variants on Testnet to find liquidity.
 */
export const GET = withAuth(async (req, { address }) => {
  const { searchParams } = new URL(req.url);
  const amount = searchParams.get("amount");
  const from = searchParams.get("from")?.toUpperCase();
  const to = searchParams.get("to")?.toUpperCase();

  if (!amount || !from || !to) {
    return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
  }

  try {
    await connectDB();
    const publicClient = createPublicClient({ chain: flowTestnet, transport: http() });
    
    const isFromFlow = from === "FLOW";

    // Probe candidates for liquidity
    for (const candidate of TESTNET_TOKENS) {
      try {
        // Calculate amountIn based on the correctly parsed decimals for the 'from' token
        const amountIn = isFromFlow 
          ? parseUnits(amount, 18) 
          : parseUnits(amount, candidate.decimals);

        const path = isFromFlow 
          ? [WFLOW_ADDRESS as `0x${string}`, candidate.address as `0x${string}`]
          : [candidate.address as `0x${string}`, WFLOW_ADDRESS as `0x${string}`];

        console.log(`[Quote] Probing liquidity for ${candidate.name} (${candidate.address})...`);
        const amountsOut = await publicClient.readContract({
          address: ROUTER_ADDRESS,
          abi: ROUTER_ABI,
          functionName: "getAmountsOut",
          args: [amountIn, path],
        });

        const formattedAmountOut = isFromFlow 
          ? formatUnits(amountsOut[1], candidate.decimals) // to USDC = 6
          : formatEther(amountsOut[1]); // to FLOW = 18

        return NextResponse.json({
          amountOut: formattedAmountOut,
          workingToken: candidate.address,
          tokenName: candidate.name,
          decimals: candidate.decimals
        });
      } catch (err) {
        console.log(`[Quote] No liquidity for ${candidate.name}`);
        continue;
      }
    }

    return NextResponse.json({ error: "No liquidity found for any tested pair on Testnet" }, { status: 404 });
  } catch (err: any) {
    return NextResponse.json({ error: "Failed to fetch quotes" }, { status: 500 });
  }
});

export const POST = withAuth(async (req, { address }) => {
  console.log(`[Swap] Initiating swap for address: ${address}`);
  
  try {
    const body = await req.json();
    const { fromAmount, fromToken, toToken, pin, workingToken } = body;

    if (!fromAmount || !fromToken || !toToken || !pin) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    await connectDB();
    const wallet = await WalletModel.findOne({ address });
    if (!wallet) return NextResponse.json({ error: "Wallet not found" }, { status: 404 });

    let mnemonic: string;
    try {
      mnemonic = decryptMnemonic(wallet.encryptedMnemonic, wallet.iv, wallet.salt, pin);
    } catch (err) {
      return NextResponse.json({ error: "Incorrect PIN" }, { status: 401 });
    }

    const account = mnemonicToAccount(mnemonic as `0x${string}`);
    const publicClient = createPublicClient({ chain: flowTestnet, transport: http() });
    const walletClient = createWalletClient({ chain: flowTestnet, transport: http() });

    const isFromFlow = fromToken.toUpperCase() === "FLOW";
    
    let currentBalance: bigint;
    if (isFromFlow) {
      currentBalance = await publicClient.getBalance({ address: address as `0x${string}` });
    } else {
      currentBalance = await publicClient.readContract({
        address: workingToken as `0x${string}`,
        abi: ERC20_ABI,
        functionName: "balanceOf",
        args: [address as `0x${string}`],
      });
    }

    let fromDecimals = 18;
    if (!isFromFlow) {
      const token = TESTNET_TOKENS.find(t => t.address.toLowerCase() === workingToken?.toLowerCase() || t.name === fromToken);
      if (token) fromDecimals = token.decimals;
    }

    const amountIn = parseUnits(fromAmount, fromDecimals);

    if (currentBalance < amountIn) {
      return NextResponse.json({ 
        error: `Insufficient ${fromToken} balance. Have: ${formatUnits(currentBalance, fromDecimals)}, Need: ${fromAmount}` 
      }, { status: 400 });
    }

    const deadline = BigInt(Math.floor(Date.now() / 1000) + 60 * 20);

    const targetToken = workingToken || DEFAULT_TOKEN.address;

    let hash: `0x${string}`;

    if (isFromFlow) {
      // FLOW -> USDC
      const path = [WFLOW_ADDRESS as `0x${string}`, targetToken as `0x${string}`];
      console.log(`[Swap] Swapping ${fromAmount} FLOW for USDC (${targetToken})...`);
      
      hash = await walletClient.writeContract({
        account,
        address: ROUTER_ADDRESS,
        abi: ROUTER_ABI,
        functionName: "swapExactETHForTokens",
        args: [0n, path, account.address, deadline],
        value: amountIn,
      });
    } else {
      // USDC -> FLOW
      const path = [targetToken as `0x${string}`, WFLOW_ADDRESS as `0x${string}`];
      console.log(`[Swap] Swapping ${fromAmount} USDC (${targetToken}) for FLOW...`);

      const approveHash = await walletClient.writeContract({
        account,
        address: targetToken as `0x${string}`,
        abi: ERC20_ABI,
        functionName: "approve",
        args: [ROUTER_ADDRESS, amountIn],
      });
      await publicClient.waitForTransactionReceipt({ hash: approveHash });

      hash = await walletClient.writeContract({
        account,
        address: ROUTER_ADDRESS,
        abi: ROUTER_ABI,
        functionName: "swapExactTokensForETH",
        args: [amountIn, 0n, path, account.address, deadline],
      });
    }

    console.log(`[Swap] Transaction sent! Hash: ${hash}`);

    await TransactionModel.create({
      userId: wallet.id,
      fromAddress: account.address,
      toAddress: ROUTER_ADDRESS,
      amount: fromAmount,
      token: `${fromToken}>${toToken}`,
      hash,
      chain: "flow",
      status: "pending",
    });

    return NextResponse.json({
      success: true,
      hash,
      message: "Swap initiated successfully",
    });

  } catch (err: any) {
    console.error("[Swap Error]", err);
    return NextResponse.json({ error: err.message || "Failed to execute swap" }, { status: 500 });
  }
});


