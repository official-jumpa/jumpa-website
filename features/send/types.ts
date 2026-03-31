export type SendMethod = "bank-transfer" | "crypto";

export type Recipient = {
  id: string;
  name: string;
  address: string;
  avatar?: string;
  bank: string;
};

export type Token = {
  id: string;
  symbol: string;
  name: string;
  balanceText: string;
  balanceRaw: number;
  iconLabel: string;
  iconColor: string;
  chainBadge?: {
    label: string;
    color: string;
    textColor?: string;
  };
};
