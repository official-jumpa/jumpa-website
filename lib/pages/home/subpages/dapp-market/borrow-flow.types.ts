export type BorrowFlowStep =
  | 'asset-selection'
  | 'address-entry'
  | 'review'
  | 'pin'
  | 'processing'
  | 'success';

export type AddressStatus = 'idle' | 'invalid' | 'valid';

export type PinStatus = 'idle' | 'typing' | 'error' | 'success';

export type BorrowAsset = {
  id: string;
  symbol: string;
  name: string;
  subtitle: string;
  iconSrc: string;
  price: string;
  change: string;
  direction: 'up' | 'down';
  accentColor: string;
  network: string;
  borrowApy: string;
  walletBalanceLabel: string;
  availableAmountText: string;
  availableCollateral: number;
  minimumCollateral: number;
  collateralToken: string;
  estimatedReceive: string;
  estimatedReceiveValue: string;
};