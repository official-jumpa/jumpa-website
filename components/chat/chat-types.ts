export type Screen =
  | "home"
  | "chat-empty"
  | "chat-responding"
  | "voice-recording"
  | "voice-processing";

export type VoiceFlow = "none" | "recording" | "sending";

export interface Message {
  id: string;
  role: "user" | "ai";
  text: string;
  imageUrls?: string[];
  time?: string;
  isTransaction?: boolean;
  isVoice?: boolean;
  transactionDetails?: {
    title?: string;
    label: string;
    sent: string;
    to: string;
    result: string;
    isScheduled?: boolean;
  };
  transactionParams?: any;
  isOtherUser?: boolean;
}
