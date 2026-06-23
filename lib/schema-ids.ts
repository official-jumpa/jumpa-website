import { customAlphabet } from "nanoid";

const alphabet = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const nanoid = customAlphabet(alphabet, 8); // 8 strings auto generated

export type IdPrefix = "USER" | "CHAT" | "TRAN" | "WALL" | "RAMP" | "SESS" | "ACCT" | "VRFY";

export const generateId = (prefix: IdPrefix) => {
  return `${prefix}_${nanoid()}`; 
};

export const generateReferralCode = (): string => {
  return `REF-${nanoid().substring(0, 6)}`;
};
