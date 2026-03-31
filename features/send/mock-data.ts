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
    id: "flow",
    symbol: "FLOW",
    name: "Flow (EVM)",
    balanceText: "0.00 Flow",
    balanceRaw: 0,
    iconLabel: "F",
    iconColor: "bg-green-500 text-white",
  },
  {
    id: "eth",
    symbol: "ETH",
    name: "Ethereum",
    balanceText: "0.00 Eth",
    balanceRaw: 0,
    iconLabel: "E",
    iconColor: "bg-indigo-500 text-white",
  },
  {
    id: "usdc",
    symbol: "USDC",
    name: "USD Coin",
    balanceText: "0.00 USDC",
    balanceRaw: 0,
    iconLabel: "U",
    iconColor: "bg-blue-600 text-white",
  },
  {
    id: "usdt",
    symbol: "USDT",
    name: "Tether",
    balanceText: "0.00 USDT",
    balanceRaw: 0,
    iconLabel: "T",
    iconColor: "bg-emerald-500 text-white",
  },
];

export const defaultToken: Token = mockTokens[0];
