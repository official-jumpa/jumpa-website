/**
 * Thin fetch wrapper for the Jumpa API.
 * All requests use relative paths to /api/* routes.
 * Credentials are always included so session cookies are sent automatically.
 */

interface ApiResponse<T = unknown> {
  data: T | null;
  error: string | null;
  status: number;
}

async function request<T>(
  path: string,
  options: RequestInit = {},
): Promise<ApiResponse<T>> {
  const url = path; // Use relative path directly

  try {
    const res = await fetch(url, {
      ...options,
      credentials: "include", // always send session cookies
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    });

    const text = await res.text();
    let data: T | null = null;
    let error: string | null = null;

    try {
      const json = JSON.parse(text) as Record<string, unknown>;
      if (res.ok) {
        data = json as T;
      } else {
        error = (json.error as string | undefined) ?? `HTTP ${res.status}`;
      }
    } catch {
      error = text || `HTTP ${res.status}`;
    }

    return { data, error, status: res.status };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Network error";
    return { data: null, error: message, status: 0 };
  }
}

// --- Wallet ---

export interface WalletAddresses {
  eth: string;
  btc: string;
  base: string;
  sol: string;
  xlm: string;
}

export interface WalletCreatedResponse {
  message: string;
  address: string;
  addresses: WalletAddresses;
}

/** GET /api/wallet — generate a fresh 12-word seed phrase */
export async function generatePhrase(): Promise<
  ApiResponse<{ phrase: string }>
> {
  return request<{ phrase: string }>("/api/wallet");
}

/** POST /api/wallet?action=create|import — save a wallet to the backend */
export async function saveWallet(
  action: "create" | "import",
  body: { phrase: string; password: string; pin: string },
): Promise<ApiResponse<WalletCreatedResponse>> {
  return request<WalletCreatedResponse>(`/api/wallet?action=${action}`, {
    method: "POST",
    body: JSON.stringify(body),
  });
}

// --- PIN ---

/** POST /api/pin/verify — verify 6-digit PIN (requires active session) */
export async function verifyPin(
  pin: string,
): Promise<ApiResponse<{ valid: boolean }>> {
  return request<{ valid: boolean }>("/api/pin/verify", {
    method: "POST",
    body: JSON.stringify({ pin }),
  });
}

/** POST /api/pin/change — change PIN (requires active session + current PIN) */
export async function changePin(
  currentPin: string,
  newPin: string,
): Promise<ApiResponse<{ message: string }>> {
  return request<{ message: string }>("/api/pin/change", {
    method: "POST",
    body: JSON.stringify({ currentPin, newPin }),
  });
}

// --- Auth Session ---

export interface WalletSetupResponse {
  message: string;
  address: string;
  addresses: WalletAddresses;
}

/**
 * POST /api/auth/wallet-setup — unified wallet creation for any
 * authenticated user (email OTP or Google social login).
 */
export async function walletSetup(
  pin: string,
  phrase?: string,
  action?: "create" | "import",
): Promise<ApiResponse<WalletSetupResponse>> {
  return request<WalletSetupResponse>("/api/auth/wallet-setup", {
    method: "POST",
    body: JSON.stringify({ pin, ...(phrase ? { phrase } : {}), ...(action ? { action } : {}) }),
  });
}

/** Returns the selected (or first) wallet for the authenticated user */
export async function getMyWallet(): Promise<ApiResponse<UserWallet>> {
  const res = await getWallets();
  if (res.error || !res.data) return { data: null, error: res.error, status: res.status };
  const selected = res.data.find(w => w.isSelected) || res.data[0] || null;
  if (!selected) return { data: null, error: "No wallet found", status: 404 };
  return { data: selected, error: null, status: 200 };
}

/** POST /api/auth/logout — clears the session cookie */
export async function logout(): Promise<ApiResponse<{ message: string }>> {
  return request<{ message: string }>("/api/auth/logout", { method: "POST" });
}

// --- Balances ---

export interface TokenBalance {
  symbol: string;
  name: string;
  address: string;
  balance: string;
  priceUsd: string;
}

export interface BalancesResponse {
  address: string;
  addresses: {
    eth: string;
    base: string;
    sol: string;
    xlm: string;
  };
  balances: {
    eth: string;
    base: string;
    sol: string;
    xlm: string;
  };
  tokens: TokenBalance[];
}

/** GET /api/wallet/balance — fetch real-time ETH and SOL balances */
export async function getBalances(): Promise<ApiResponse<BalancesResponse>> {
  return request<BalancesResponse>("/api/wallet/balance");
}

export interface WalletBalanceSummary {
  address: string;
  totalUsd: string;
}

/** GET /api/wallet/balance?q=all — fetch total USD balance for all user wallets */
export async function getAllWalletBalances(): Promise<ApiResponse<WalletBalanceSummary[]>> {
  return request<WalletBalanceSummary[]>("/api/wallet/balance?q=all");
}

// --- AI Agent ---

export interface AiIntentResponse {
  intent: "SEND_FUNDS" | "CHECK_BALANCE" | "SWAP_TOKEN" | "ONRAMP_CRYPTO" | "OFFRAMP_CRYPTO" | "CHAT";
  params: Record<string, any>;
  message: string;
}

/** POST /api/ai/intent — parse user prompt into a structured crypto action */
export async function postAiIntent(
  prompt: string,
): Promise<ApiResponse<AiIntentResponse>> {
  return request<AiIntentResponse>("/api/ai/intent", {
    method: "POST",
    body: JSON.stringify({ prompt }),
  });
}

/** GET /api/ai/history — fetch persistent chat history logs */
export async function getAiHistory(): Promise<
  ApiResponse<{ messages: any[] }>
> {
  return request<{ messages: any[] }>("/api/ai/history");
}

/** PUT /api/ai/history — save/sync persistent chat history logs */
export async function putAiHistory(
  messages: any[],
): Promise<ApiResponse<{ success: boolean }>> {
  return request<{ success: boolean }>("/api/ai/history", {
    method: "PUT",
    body: JSON.stringify({ messages }),
  });
}

// --- Transfers & History ---

export interface Recipient {
  address: string;
  lastUsed: string;
  token: string;
}

/** POST /api/wallet/transfer — execute on-chain transfer */
export async function postTransfer(data: {
  to: string;
  amount: string;
  token: string;
  pin: string;
}): Promise<ApiResponse<{ success: boolean; hash: string }>> {
  return request<{ success: boolean; hash: string }>("/api/wallet/transfer", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

/** GET /api/wallet/recipients — fetch last 5 unique recipients */
export async function getRecipients(): Promise<
  ApiResponse<{ recipients: Recipient[] }>
> {
  return request<{ recipients: Recipient[] }>("/api/wallet/recipients");
}

/** GET /api/wallet/swap/quote — fetch real-time swap quote */
export async function getSwapQuote(
  amount: string,
  from: string,
  to: string,
): Promise<
  ApiResponse<{ amountOut: string; workingToken: string; tokenName: string; rawQuote?: any }>
> {
  return request<{
    amountOut: string;
    workingToken: string;
    tokenName: string;
    rawQuote?: any;
  }>(`/api/wallet/swap?amount=${amount}&from=${from}&to=${to}`);
}

/** POST /api/wallet/swap — execute on-chain token swap */
export async function postSwap(data: {
  fromToken: string;
  toToken: string;
  fromAmount: string;
  pin: string;
  workingToken?: string;
  rawQuote?: any;
}): Promise<ApiResponse<{ success: boolean; hash: string }>> {
  return request<{ success: boolean; hash: string }>("/api/wallet/swap", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

// --- Dynamic Transactions ---

export interface TransactionRecord {
  _id: string;
  fromAddress: string;
  toAddress: string;
  amount: string;
  token: string;
  hash: string;
  status: "pending" | "confirmed" | "failed";
  chain: string;
  createdAt: string;
}

/** GET /api/wallet/transactions — fetch dynamic user transactions */
export async function getTransactions(): Promise<
  ApiResponse<{ addresses: WalletAddresses; transactions: TransactionRecord[] }>
> {
  return request<{ addresses: WalletAddresses; transactions: TransactionRecord[] }>("/api/wallet/transactions");
}

export interface UserWallet {
  address: string;
  name: string;
  addresses: WalletAddresses;
  publicKeys: Record<string, string>;
  createdAt: string;
  isSelected: boolean;
}

/** GET /api/wallet/list — fetch all wallets for the authenticated user */
export async function getWallets(): Promise<ApiResponse<UserWallet[]>> {
  return request<UserWallet[]>("/api/wallet/list");
}

/** PUT /api/wallet/list — select active wallet */
export async function selectWallet(address: string): Promise<ApiResponse<{ message: string; address: string }>> {
  return request<{ message: string; address: string }>("/api/wallet/list", {
    method: "PUT",
    body: JSON.stringify({ address }),
  });
}

/** PATCH /api/wallet/list — rename a wallet */
export async function renameWallet(address: string, name: string): Promise<ApiResponse<{ message: string; name: string }>> {
  return request<{ message: string; name: string }>("/api/wallet/list", {
    method: "PATCH",
    body: JSON.stringify({ address, name }),
  });
}

