export interface OnRampResponse {
  success: boolean;
  status: number;
  message: string;
  data?: {
    deposit: {
      bank_name: string;
      bank_code: string;
      account_name: string;
      account_number: string;
      note: string[];
    };
    reference: string;
    destination: {
      amount: number;
      currency: string;
    };
  };
  error?: string;
}

export interface OffRampResponse {
  success: boolean;
  message: string;
  data?: {
    status: string;
    type: string;
    reference: string;
    rate: number;
    source?: {
      amount: number;
      currency: string;
    };
    destination: {
      amount: number;
      currency: string;
    };
    deposit: {
      amount: number;
      address: string;
      asset: string;
      note?: string[];
    };
  };
  error?: string;
  status?: number;
}

export interface QuoteResponse {
  success: boolean;
  data?: {
    rate: number;
    source?: {
      amount: number;
      currency: string;
    };
    destination: {
      amount: number;
      currency: string;
    };
  };
  message?: string;
  error?: string;
}

export class SwitchService {
  private static readonly BASE_URL = "https://api.onswitch.xyz";

  private static getHeaders(): HeadersInit {
    // Uses the live switch key matching the environment
    return {
      "Content-Type": "application/json",
      "X-Service-Key": process.env.SWITCH_LIVE_KEY || "",
    };
  }

  static async initiateOnRamp(
    amount: number,
    asset: string,
    walletAddress: string,
    isExactOut: boolean = false
  ): Promise<OnRampResponse> {
    try {
      const payload = {
        amount: amount,
        country: "NG",
        currency: "NGN",
        asset: asset,
        beneficiary: {
          holder_type: "INDIVIDUAL",
          holder_name: "Jumpa User",
          wallet_address: walletAddress
        },
        exact_output: isExactOut,
        rail: "NIBSS"
      };

      console.log("[SwitchService] Initiating onramp:", JSON.stringify(payload, null, 2));

      const response = await fetch(`${this.BASE_URL}/onramp/initiate`, {
        method: "POST",
        headers: this.getHeaders(),
        body: JSON.stringify(payload),
      });

      const responseData = await response.json();

      console.log("[SwitchService] Onramp response:", JSON.stringify(responseData, null, 2));

      if (!response.ok || !responseData.success) {
        return {
          success: false,
          status: response.status,
          message: responseData.message || "Failed to initiate transaction",
          error: JSON.stringify(responseData)
        };
      }

      return responseData;

    } catch (error: any) {
      console.error("[SwitchService] Error initiating onramp:", error);
      return {
        success: false,
        status: 500,
        message: "Internal server error",
        error: error.message
      };
    }
  }

  static async getQuote(amount: number, asset: string, isExactOut: boolean = false): Promise<QuoteResponse> {
    try {
      const payload = {
        amount: amount,
        country: "NG",
        currency: "NGN",
        asset: asset,
        rail: "NIBSS",
        exact_output: isExactOut
      };

      const response = await fetch(`${this.BASE_URL}/onramp/quote`, {
        method: "POST",
        headers: this.getHeaders(),
        body: JSON.stringify(payload),
      });

      const responseData = await response.json();

      if (!response.ok || !responseData.success) {
        return {
          success: false,
          message: responseData.message || "Failed to fetch quote"
        };
      }

      return responseData;
    } catch (error: any) {
      console.error("[SwitchService] Error fetching quote:", error);
      return {
        success: false,
        message: "Internal server error",
        error: error.message
      };
    }
  }
  static async getOfframpQuote(amount: number, asset: string, isExactOut: boolean = false): Promise<QuoteResponse> {
    try {
      const payload = {
        amount,
        country: "NG",
        currency: "NGN",
        asset,
        rail: "BANK",
        exact_output: isExactOut
      };

      const response = await fetch(`${this.BASE_URL}/offramp/quote`, {
        method: "POST",
        headers: this.getHeaders(),
        body: JSON.stringify(payload),
      });

      const responseData = await response.json();

      if (!response.ok || !responseData.success) {
        return {
          success: false,
          message: responseData.message || "Failed to fetch offramp quote"
        };
      }

      return responseData;
    } catch (error: any) {
      console.error("[SwitchService] Error fetching offramp quote:", error);
      return {
        success: false,
        message: "Internal server error",
        error: error.message
      };
    }
  }

  static async initiateOfframp(
    amount: number,
    asset: string,
    beneficiary: {
      holder_name: string;
      account_number: string;
      bank_code: string;
    },
    isExactOut: boolean = false
  ): Promise<OffRampResponse> {
    try {
      const payload = {
        amount,
        country: "NG",
        currency: "NGN",
        asset,
        beneficiary: {
          holder_type: "INDIVIDUAL",
          ...beneficiary
        },
        channel: "BANK",
        exact_output: isExactOut
      };

      console.log("[SwitchService] Initiating offramp:", JSON.stringify(payload, null, 2));

      const response = await fetch(`${this.BASE_URL}/offramp/initiate`, {
        method: "POST",
        headers: this.getHeaders(),
        body: JSON.stringify(payload),
      });

      const responseData = await response.json();
      console.log("[SwitchService] Offramp response:", JSON.stringify(responseData, null, 2));

      if (!response.ok || !responseData.success) {
        return {
          success: false,
          status: response.status,
          message: responseData.message || "Failed to initiate transaction",
          error: JSON.stringify(responseData)
        };
      }

      return responseData;

    } catch (error: any) {
      console.error("[SwitchService] Error initiating offramp:", error);
      return {
        success: false,
        status: 500,
        message: "Internal server error",
        error: error.message
      };
    }
  }
}
