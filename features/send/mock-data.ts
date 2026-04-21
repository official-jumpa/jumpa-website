import type { Recipient, Token } from "./types";

export const mockRecipients: Recipient[] = [
  {
    id: "91679078",
    name: "Anita",
    address: "0xB7...BYz9",
    bank: "Opay",
  },
  {
    id: "916945687",
    name: "Anita Bernard",
    address: "0xB7...BYz9",
    avatar: "AB",
    bank: "Opay",
  },
  {
    id: "916934209",
    name: "Lukas",
    address: "0xB7...BYz9",
    avatar: "LU",
    bank: "Opay",
  },
  {
    id: "916901278",
    name: "Manuel",
    address: "0xB7...BYz9",
    avatar: "MA",
    bank: "Opay",
  },
  {
    id: "916902331",
    name: "Nwakaego",
    address: "0xB7...BYz9",
    avatar: "NW",
    bank: "Opay",
  },
];

export const defaultRecipient: Recipient = {
  id: "",
  name: "",
  address: "",
  bank: "",
};

export const mockTokens: Token[] = [
  {
    id: "sol-mainnet",
    symbol: "SOL",
    name: "Solana Mainnet",
    balanceText: "0.00 SOL",
    balanceRaw: 0,
    iconLabel: "S",
    iconColor: "bg-purple-500 text-white",
  },
  {
    id: "sol-devnet",
    symbol: "SOL (Dev)",
    name: "Solana Devnet",
    balanceText: "0.00 SOL",
    balanceRaw: 0,
    iconLabel: "S",
    iconColor: "bg-purple-300 text-white",
  },
  {
    id: "base-mainnet",
    symbol: "ETH-BASE",
    name: "Base Mainnet",
    balanceText: "0.00 ETH",
    balanceRaw: 0,
    iconLabel: "B",
    iconColor: "bg-blue-500 text-white",
  },
  {
    id: "base-sepolia",
    symbol: "ETH (Sep)",
    name: "Base Sepolia",
    balanceText: "0.00 ETH",
    balanceRaw: 0,
    iconLabel: "B",
    iconColor: "bg-blue-300 text-white",
  },
  {
    id: "xlm-public",
    symbol: "XLM",
    name: "Stellar",
    balanceText: "0.00 XLM",
    balanceRaw: 0,
    iconLabel: "X",
    iconColor: "bg-zinc-800 text-white",
  },
  {
    id: "xlm-testnet",
    symbol: "XLM (Test)",
    name: "Stellar Testnet",
    balanceText: "0.00 XLM",
    balanceRaw: 0,
    iconLabel: "X",
    iconColor: "bg-zinc-500 text-white",
  }
];

export const defaultToken: Token = mockTokens[0];
