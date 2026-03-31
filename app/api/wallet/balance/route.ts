import { NextRequest, NextResponse } from "next/server";
import { createPublicClient, http, formatEther, defineChain, formatUnits } from "viem";
import { mainnet } from "viem/chains";
import * as fcl from "@onflow/fcl";
import { withAuth } from "@/lib/withAuth";
import { publicKeyToAddress } from "viem/utils";

fcl.config({
  "accessNode.api": "https://rest-testnet.onflow.org",
  "flow.network": "testnet",
});

const flowTestnet = defineChain({
  id: 545,
  name: 'Flow EVM Testnet',
  network: 'flow-testnet',
  nativeCurrency: { decimals: 18, name: 'Flow', symbol: 'FLOW' },
  rpcUrls: {
    default: { http: ['https://testnet.evm.nodes.onflow.org'] },
  },
});

const ethClient = createPublicClient({
  chain: mainnet,
  transport: http("https://cloudflare-eth.com"),
});

const flowEvmClient = createPublicClient({
  chain: flowTestnet,
  transport: http(), 
});

const USDC_ADDRESS = "0xd7d43ab7b365f0d0789aE83F4385fA710FfdC98F"; // PYUSD0 on Testnet
const ERC20_ABI = [
  {
    name: "balanceOf",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ name: "balance", type: "uint256" }],
  },
] as const;

/**
 * GET /api/wallet/balance
 */
export const GET = withAuth(async (req, { address }) => {

  const ethAddress = address.length === 66 || (address.startsWith("0x") && address.length === 66+2)
    ? publicKeyToAddress(address.startsWith("0x") ? address as `0x${string}` : `0x${address}`)
    : address as `0x${string}`;

  try {
    const ethBalancePromise = ethClient.getBalance({ address: ethAddress })
      .then(b => formatEther(b))
      .catch(err => {
        console.error("[Balance] ETH fetch error:", err);
        return "0.00";
      });

    const flowBalancePromise = flowEvmClient.getBalance({ address: ethAddress })
      .then(b => formatEther(b))
      .catch(err => {
        console.error("[Balance] FLOW EVM fetch error:", err);
        return "0.00";
      });

    const usdcBalancePromise = flowEvmClient.readContract({
      address: USDC_ADDRESS,
      abi: ERC20_ABI,
      functionName: "balanceOf",
      args: [ethAddress],
    })
      .then(b => formatUnits(b, 6)) // USDC = 6 decimals
      .catch(err => {
        console.error("[Balance] USDC fetch error:", err);
        return "0.00";
      });

    const [ethBalance, flowBalance, usdcBalance] = await Promise.all([
      ethBalancePromise,
      flowBalancePromise,
      usdcBalancePromise,
    ]);

    return NextResponse.json({
      address: ethAddress,
      addresses: {
        eth: ethAddress,
        flow: ethAddress,
      },
      balances: {
        eth: ethBalance,
        flow: flowBalance,
        usdc: usdcBalance,
      },
      tokens: [
        {
          symbol: "FLOW",
          name: "Flow (EVM)",
          address: ethAddress,
          balance: flowBalance,
          priceUsd: "0.84",
        },
        {
          symbol: "ETH",
          name: "Ethereum",
          address: ethAddress,
          balance: ethBalance,
          priceUsd: "2540.21", 
        },
        {
          symbol: "USDC",
          name: "USD Coin",
          address: USDC_ADDRESS,
          balance: usdcBalance,
          priceUsd: "1.00",
        }
      ]
    });
  } catch (err) {
    console.error("[Balance] General error:", err);
    return NextResponse.json({ error: "Failed to fetch balances" }, { status: 500 });
  }
});
