export interface Wallet {
  id: string;
  name: string;
  symbol?: string;
  address: string;
  fullAddress: string;
  balance: string;
  privateKey: string;
  color: string;
}

export const wallets: Wallet[] = [
  {
    id: 'btc',
    name: 'Btc wallet',
    symbol: 'BTC',
    address: '0xB7...BY38',
    fullAddress: '0xB7a4c9e2f158d3a6b72e8c4f91d0a3e7c5b8f2d4',
    balance: '$1.00',
    privateKey: '0x718966f637575f0e687318693f865993786599378993878699946889386ff847',
    color: '#F7931A',
  },
  {
    id: 'eth',
    name: 'Eth wallet',
    symbol: 'ETH',
    address: '0xE4...4C6E',
    fullAddress: '0xE4b2a7f1c839d5e6a48f3b2c71e0d9a4f6c8b5e2',
    balance: '$1.00',
    privateKey: '0xa2b9c4d8e1f7369852147630abcdef9876543210fedcba9876543210abcdef12',
    color: '#627EEA',
  },
  {
    id: 'sol',
    name: 'Sol wallet',
    symbol: 'SOL',
    address: '0xS2...7F3A',
    fullAddress: '0xS2d7f8a1b4c6e9d3f57a2b8c4e1d6f9a3b7c5e8d',
    balance: '$1.00',
    privateKey: '0xf1e2d3c4b5a69788796a5b4c3d2e1f08192a3b4c5d6e7f8091a2b3c4d5e6f708',
    color: '#9945FF',
  },
  {
    id: 'ama',
    name: 'AMA wallet',
    symbol: 'AMA',
    address: '0xA1...9D2B',
    fullAddress: '0xA1c3e5d7f9b2d4f6a8c1e3d5f7b9a2c4e6d8f1a3',
    balance: '$1.00',
    privateKey: '0x112233445566778899aabbccddeeff00112233445566778899aabbccddeeff00',
    color: '#7C5CFC',
  },
];

export interface MainWallet {
  name: string;
  address: string;
  balance: string;
  change: string;
  changeDirection: 'up' | 'down';
  token: string;
}

export const mainWallet: MainWallet = {
  name: 'Main wallet',
  address: '0xB7...BY38',
  balance: '$1.00',
  change: '+6.12%',
  changeDirection: 'up',
  token: 'USDC',
};
