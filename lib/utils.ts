import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formats backend token symbols into clean UI display names.
 * e.g., "SOL-DEV" -> "SOL", "USDC-SOL-DEV" -> "USDC", "SOL (Dev)" -> "SOL"
 */
export function formatDisplayToken(symbol: string): string {
  if (!symbol) return "";
  let clean = symbol.toUpperCase();
  
  if (clean.startsWith("USDC-")) return "USDC";
  if (clean.startsWith("USDT-")) return "USDT";
  if (clean.startsWith("ETH-")) return "ETH";
  
  clean = clean.replace("-DEV", "");
  clean = clean.replace(" (DEV)", "");
  clean = clean.replace(" (SEP)", "");
  clean = clean.replace(" (TEST)", "");
  
  return clean;
}
