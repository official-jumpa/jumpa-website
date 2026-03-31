"use client"
import { useState, useRef, useEffect, useCallback, type RefObject, type ReactNode } from "react";
import { useRouter } from 'next/navigation';
import { getAiHistory, postAiIntent, postTransfer, postSwap } from "@/lib/api";
import { useNavigate, useLocation } from "@/lib/pages-adapter";
import TransactionConfirmDrawer, { type TransactionDetails } from "@/features/send/components/TransactionConfirmDrawer";
import "@/lib/pages/home/home.css";
import "./AiChat.css";

const chatCloseIcon = '/assets/icons/actions/close.svg';
const jumpaLogoMark = '/assets/icons/actions/Group 85 (1).svg';
const ellipseDot = '/assets/icons/actions/ellipse 29.svg';
const docIcon = '/assets/icons/actions/doc.svg';
const voiceIcon = '/assets/icons/actions/voice.svg';
const sendBtnIcon = '/assets/icons/actions/sendbtn.svg';
const vnIcon = '/assets/icons/actions/vn.svg';
const deleteIcon = '/assets/icons/actions/delete.svg';
const sendCheckIcon = '/assets/icons/actions/send.svg';
const sendingIcon = '/assets/icons/actions/sending.svg';
const userAvatarImg = '/assets/images/avatars/prince.svg';
const botAvatarImg = '/assets/icons/actions/bot.png';

type Screen =
  | "welcome"
  | "home"
  | "chat-empty"
  | "chat-responding"
  | "voice-recording"
  | "voice-processing";

type VoiceFlow = "none" | "recording" | "preview" | "sending";

interface Message {
  id: string;
  role: "user" | "ai";
  text: string;
  time?: string;
  isTransaction?: boolean;
  isVoice?: boolean;
  transactionDetails?: {
    label: string;
    sent: string;
    to: string;
    result: string;
    isScheduled?: boolean;
  };
  transactionParams?: any;
}

function TextWithLinks({ text }: { text: string }) {
  // Robust regex for markdown links including multiline and long hashes
  const parts = text.split(/(\[[\s\S]*?\]\(https?:\/\/\S+?\))/g);
  return (
    <>
      {parts.map((part, i) => {
        const match = part.match(/\[([\s\S]*?)\]\((https?:\/\/\S+?)\)/);
        if (match) {
          return (
            <a
              key={i}
              href={match[2]}
              target="_blank"
              rel="noopener noreferrer"
              className="text-white underline font-bold hover:text-white/80 transition-colors break-all"
            >
              {match[1]}
            </a>
          );
        }
        return <span key={i}>{part}</span>;
      })}
    </>
  );
}

const SUGGESTIONS = [
  "How do i invest $100 ?",
  "Analyze my portfolio and suggest investment",
  "Show my recent transfers and fees",
  "Buy AMA when price is -10% with 100$",
  "Exchange $30 to USDC Sol",
  "Exchange $30 to USDC ETh",
];

const WELCOME_BUBBLES = [
  { key: "1", cls: "welcome-bubble--1", text: "Send $20 to $Nita" },
  { key: "2", cls: "welcome-bubble--2", text: "Send two thousand naira to 9169495 opay" },
  { key: "3", cls: "welcome-bubble--3", text: "How much have i sent to Ola in two months ?" },
  { key: "4", cls: "welcome-bubble--4", text: "Send $2 to Lukas by 2pm tomorrow sol usdc" },
  { key: "5", cls: "welcome-bubble--5", text: "Send 2 Sol 7EcDhSYGxX" },
  { key: "6", cls: "welcome-bubble--6", text: "Send 2 ETh to 0x456d9347342" },
  { key: "7", cls: "welcome-bubble--7", text: "Send 2 Ama to AMa56d9347342" },
] as const;

function useAutosizeTextArea(textAreaRef: RefObject<HTMLTextAreaElement | null>, value: string) {
  useEffect(() => {
    const el = textAreaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(160, Math.max(40, el.scrollHeight))}px`;
  }, [value, textAreaRef]);
}

function TypingDots() {
  return (
    <div style={{ display: "flex", gap: 5, alignItems: "center", padding: "4px 2px" }}>
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          style={{
            width: 11,
            height: 11,
            borderRadius: "50%",
            background: "rgb(124, 92, 252)",
            display: "inline-block",
            animation: `jbounce 1.2s ${i * 0.2}s infinite ease-in-out`,
          }}
        />
      ))}
    </div>
  );
}

function WelcomeOverlay({ onClose }: { onClose: () => void }) {
  return (
    <>
      <div className="chat-welcome-backdrop" aria-hidden />
      <div
        className="chat-welcome-modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-labelledby="chat-welcome-title"
        aria-modal="true"
      >
        <button type="button" className="chat-welcome-close" onClick={onClose} aria-label="Close">
          <img src={chatCloseIcon} alt="" width={12} height={12} />
        </button>
        <img src={jumpaLogoMark} alt="" className="chat-welcome-logo" width={118} height={67} />
        <div className="chat-welcome-headings">
          <h2 id="chat-welcome-title" className="chat-welcome-title">
            Welcome to Jumpa
          </h2>
          <p className="chat-welcome-subtitle">Text our Ai to run all transactions</p>
        </div>
        <div className="chat-welcome-bubbles" aria-hidden>
          {WELCOME_BUBBLES.map((b) => (
            <div key={b.key} className={`welcome-bubble ${b.cls}`}>
              <p className="welcome-bubble-text">{b.text}</p>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

function ChatHomePanel({ onPromptClick, onBack }: { onPromptClick: (p: string) => void; onBack: () => void }) {
  return (
    <div className="chat-home-panel-inner">
      <header className="chat-home-header">
        <div className="flex justify-between items-start mb-4">
          <div className="chat-home-title-block">
            <p className="chat-home-title-line">HI dear</p>
            <p className="chat-home-title-line">Start your transactions..</p>
          </div>
          <button
            onClick={onBack}
            className="text-white/50 text-xs hover:text-white transition-colors"
          >
            ← Back to Home
          </button>
        </div>
        <p className="chat-home-subtitle">Prompt our Ai to make any transaction .</p>
      </header>
      <div className="chat-suggestions">
        {SUGGESTIONS.map((s, i) => (
          <button
            key={i}
            type="button"
            className="chat-suggestion-row"
            onClick={() => onPromptClick(s)}
          >
            <img src={ellipseDot} alt="" className="chat-suggestion-dot" width={12} height={12} />
            <div className="chat-suggestion-text-wrap">
              <p className="chat-suggestion-text">{s}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

function barsFromRecordingTick(tick: number) {
  return Math.min(14, Math.max(2, 2 + Math.floor(tick / 4)));
}

interface ChatComposerProps {
  value: string;
  onChange: (v: string) => void;
  voiceFlow: VoiceFlow;
  recordingTick: number;
  voicePreviewBars: number;
  textAreaRef: RefObject<HTMLTextAreaElement | null>;
  onMic: () => void;
  onDoc: () => void;
  onTypingSend: () => void;
  onIdleSendClick: () => void;
  onRecordingCancel: () => void;
  onRecordingStopToPreview: () => void;
  onPreviewCancel: () => void;
  onPreviewSend: () => void;
}

function ChatComposer({
  value,
  onChange,
  voiceFlow,
  recordingTick,
  voicePreviewBars,
  textAreaRef,
  onMic,
  onDoc,
  onTypingSend,
  onIdleSendClick,
  onRecordingCancel,
  onRecordingStopToPreview,
  onPreviewCancel,
  onPreviewSend,
}: ChatComposerProps) {
  useAutosizeTextArea(textAreaRef, value);

  const isVoice = voiceFlow !== "none";
  const isTyping = !isVoice && value.trim().length > 0;

  const wrapClass = isTyping ? "chat-input-gradient-wrap chat-input-gradient-wrap--expanded" : "chat-input-gradient-wrap";

  let row: ReactNode;

  if (voiceFlow === "recording") {
    const n = barsFromRecordingTick(recordingTick);
    row = (
      <div className="chat-input-row chat-input-row--voice">
        <div className="chat-vn-strip">
          {Array.from({ length: n }, (_, i) => (
            <img key={`${n}-${i}`} src={vnIcon} alt="" className="chat-vn-icon" />
          ))}
        </div>
        <div className="chat-input-icons" style={{ width: "auto", gap: 8 }}>
          <button type="button" className="chat-composer-voice-btn" onClick={onRecordingCancel} aria-label="Cancel recording">
            <img src={deleteIcon} alt="" />
          </button>
          <button type="button" className="chat-composer-voice-btn" onClick={onRecordingStopToPreview} aria-label="Stop and preview">
            <img src={sendCheckIcon} alt="" />
          </button>
        </div>
      </div>
    );
  } else if (voiceFlow === "preview" || voiceFlow === "sending") {
    const sending = voiceFlow === "sending";
    row = (
      <div className="chat-input-row chat-input-row--voice">
        <div className="chat-vn-strip">
          {Array.from({ length: voicePreviewBars }, (_, i) => (
            <img key={i} src={vnIcon} alt="" className="chat-vn-icon" />
          ))}
        </div>
        <div className="chat-input-icons" style={{ width: "auto", gap: 8 }}>
          <button
            type="button"
            className="chat-composer-voice-btn"
            onClick={onPreviewCancel}
            disabled={sending}
            aria-label="Discard voice note"
          >
            <img src={deleteIcon} alt="" />
          </button>
          <button
            type="button"
            className="chat-composer-voice-btn"
            onClick={onPreviewSend}
            disabled={sending}
            aria-label={sending ? "Sending" : "Send voice note"}
          >
            <img src={sending ? sendingIcon : sendCheckIcon} alt="" />
          </button>
        </div>
      </div>
    );
  } else if (isTyping) {
    row = (
      <div className="chat-input-row chat-input-row--typing">
        <textarea
          ref={textAreaRef}
          className="chat-input-textarea"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Send a message..."
          rows={1}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              onTypingSend();
            }
          }}
        />
        <button type="button" className="chat-composer-send-large" onClick={onTypingSend} aria-label="Send message">
          <img src={sendBtnIcon} alt="" />
        </button>
      </div>
    );
  } else {
    row = (
      <div className="chat-input-row">
        <textarea
          ref={textAreaRef}
          className="chat-input-textarea"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Send a message..."
          rows={1}
          style={{ minHeight: 38, maxHeight: 44 }}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey && value.trim()) {
              e.preventDefault();
              onTypingSend();
            }
          }}
        />
        <div className="chat-input-icons">
          <button type="button" className="chat-input-icon-btn" onClick={onDoc} aria-label="Attach document">
            <img src={docIcon} alt="" />
          </button>
          <button type="button" className="chat-input-icon-btn" onClick={onMic} aria-label="Voice note">
            <img src={voiceIcon} alt="" />
          </button>
          <button type="button" className="chat-input-icon-btn" onClick={onIdleSendClick} aria-label="Send">
            <img src={sendBtnIcon} alt="" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="chat-composer-section">
      <div className={wrapClass}>
        <div className="chat-input-inner">
          {row}
        </div>
      </div>
    </div>
  );
}

function ChatScreen({
  messages,
  showTyping,
  composer,
  onBack,
  onTransactionClick,
}: {
  messages: Message[];
  showTyping: boolean;
  composer: ReactNode;
  onBack: () => void;
  onTransactionClick: (msg: Message) => void;
}) {
  const endRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const timer = setTimeout(() => {
      endRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
    return () => clearTimeout(timer);
  }, [messages, showTyping]);

  return (
    <div className="ai-chat-chat-screen">
      <div className="px-5 flex justify-end">
        <button
          onClick={onBack}
          className="text-white/40 text-xs uppercase tracking-wider hover:text-white transition-colors py-4"
        >
          Close Chat
        </button>
      </div>
      <div className="ai-chat-messages">
        {messages.map((m) => (
          <div key={m.id} style={{ marginBottom: 18 }}>
            {m.role === "user" ? (
              <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "flex-end", gap: 8 }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
                  <div
                    style={{
                      background: "rgba(124, 92, 252, 0.15)",
                      color: "#fff",
                      padding: "12px 16px",
                      borderRadius: "18px 18px 4px 18px",
                      fontSize: 13,
                      maxWidth: 260,
                      lineHeight: 1.5,
                      border: "1px solid rgba(124, 92, 252, 0.1)"
                    }}
                  >
                    {m.isVoice ? "🎤 Voice message" : m.text}
                  </div>
                  {m.time && (
                    <span style={{ color: "rgb(124, 92, 252)", opacity: 0.8, fontSize: 11 }}>
                      Read • {m.time}
                    </span>
                  )}
                </div>
                <img src={userAvatarImg} alt="" className="chat-msg-avatar chat-msg-avatar--user" />
              </div>
            ) : (
              <div style={{ display: "flex", justifyContent: "flex-start", alignItems: "flex-end", gap: 8 }}>
                <img src={botAvatarImg} alt="" className="chat-msg-avatar chat-msg-avatar--bot" />
                {m.isTransaction ? (
                  <button
                    onClick={() => onTransactionClick(m)}
                    className="flex flex-col gap-2 text-left w-full max-w-[260px] active:scale-95 transition-transform"
                  >
                    <div
                      style={{
                        background: "rgb(124, 92, 252)",
                        color: "#fff",
                        padding: "8px 16px",
                        borderRadius: 20,
                        fontSize: 13,
                        fontWeight: 600,
                        display: "inline-block",
                      }}
                    >
                      {m.transactionDetails?.label}
                    </div>
                    <div
                      style={{
                        background: "rgba(255, 255, 255, 0.05)",
                        color: "#fff",
                        padding: "12px 16px",
                        borderRadius: "4px 18px 18px 18px",
                        fontSize: 13,
                        width: "100%",
                        lineHeight: 1.7,
                        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                        border: "1px solid rgba(255, 255, 255, 0.08)",
                        overflowWrap: "anywhere",
                        wordBreak: "break-word",
                      }}
                    >
                      <div style={{ fontWeight: 700 }}>Withdrawal initiated!</div>
                      <div>{m.transactionDetails?.sent}</div>
                      <div>{m.transactionDetails?.to}</div>
                      <div style={{ color: "#3EC6C6", fontWeight: 600 }}>{m.transactionDetails?.result}</div>
                    </div>
                  </button>
                ) : (
                  <div
                    style={{
                      background: "rgba(255, 255, 255, 0.05)",
                      color: "#fff",
                      padding: "12px 16px",
                      borderRadius: "4px 18px 18px 18px",
                      fontSize: 13,
                      maxWidth: 280,
                      lineHeight: 1.6,
                      whiteSpace: "pre-line",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                      border: "1px solid rgba(255, 255, 255, 0.08)",
                      overflowWrap: "anywhere",
                      wordBreak: "break-word",
                    }}
                  >
                    <TextWithLinks text={m.text} />
                  </div>
                )}
              </div>
            )}
          </div>
        ))}

        {showTyping && (
          <div style={{ display: "flex", alignItems: "flex-end", gap: 8 }}>
            <img src={botAvatarImg} alt="" className="chat-msg-avatar chat-msg-avatar--bot" />
            <div style={{ background: "rgba(124, 92, 252, 0.1)", borderRadius: "4px 18px 18px 18px", padding: "8px 14px" }}>
              <TypingDots />
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>
      {composer}
    </div>
  );
}

function VoiceScreen({ processing }: { processing: boolean }) {
  return (
    <div className="ai-chat-voice-screen">
      <div style={{ flex: 1 }} />
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "14px 16px 20px",
          borderTop: "1px solid #2A2A3A",
          background: "#0A0A0F",
          flexShrink: 0,
        }}
      >
        <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 2, height: 36 }}>
          {Array.from({ length: 45 }).map((_, i) => (
            <div
              key={i}
              style={{
                width: 3,
                borderRadius: 2,
                background: processing ? "rgb(124, 92, 252)" : "#8888AA",
                height: `${16 + Math.abs(Math.sin(i * 0.7)) * 20}px`,
                opacity: 0.6 + Math.abs(Math.sin(i * 0.5)) * 0.4,
                animation: processing ? `vwave 1s ${i * 0.02}s infinite alternate ease-in-out` : "none",
              }}
            />
          ))}
        </div>
        <button
          type="button"
          style={{
            width: 40,
            height: 40,
            borderRadius: "50%",
            border: "none",
            background: "#1A1A24",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8888AA" strokeWidth="2.5">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
        <button
          type="button"
          style={{
            width: 40,
            height: 40,
            borderRadius: "50%",
            border: "none",
            background: "rgb(124, 92, 252)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
          }}
        >
          {processing ? (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          ) : (
            <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#fff" }} />
          )}
        </button>
      </div>
    </div>
  );
}

export default function AiChat() {
  const navigate = useNavigate();
  const location = useLocation();
  const [screen, setScreen] = useState<Screen>("welcome");

  // Persistent messages from the backend
  const [messages, setMessages] = useState<Message[]>([]);

  const [showTyping, setShowTyping] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [voiceFlow, setVoiceFlow] = useState<VoiceFlow>("none");
  const [recordingTick, setRecordingTick] = useState(0);
  const [voicePreviewBars, setVoicePreviewBars] = useState(8);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  // Fetch history on mount
  useEffect(() => {
    const fetchHistory = async () => {
      const res = await getAiHistory();
      if (res.data?.messages) {
        setMessages(res.data.messages);
        // Automatically enter conversation if history exists
        if (res.data.messages.length > 0) {
          setScreen("chat-empty");
        }
      }
    };
    fetchHistory();
  }, []);

  // Transaction State
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmProcessing, setConfirmProcessing] = useState(false);
  const [pendingTransaction, setPendingTransaction] = useState<TransactionDetails | null>(null);

  const showWelcomeOverlay = screen === "welcome";

  useEffect(() => {
    if (voiceFlow !== "recording") return;
    const id = window.setInterval(() => setRecordingTick((t) => t + 1), 110);
    return () => window.clearInterval(id);
  }, [voiceFlow]);

  const resetVoice = useCallback(() => {
    setVoiceFlow("none");
    setRecordingTick(0);
  }, []);

  const hideHomeDiscover =
    screen === "chat-empty" ||
    screen === "chat-responding" ||
    (screen === "home" && (inputValue.length > 0 || voiceFlow !== "none"));

  const enterThreadIfNeeded = useCallback(() => {
    if (screen === "home") setScreen("chat-empty");
  }, [screen]);

  const handleSendText = useCallback(async () => {
    const t = inputValue.trim();
    if (!t) return;

    enterThreadIfNeeded();
    const userMsg: Message = {
      id: `u-${Date.now()}`,
      role: "user",
      text: t,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue("");
    resetVoice();
    setScreen("chat-responding");
    setShowTyping(true);

    try {
      const res = await postAiIntent(t);
      setShowTyping(false);

      if (res.data) {
        const aiMsg: Message = {
          id: `a-${Date.now()}`,
          role: "ai",
          text: res.data.message,
        };

        // If intent is a transaction, we can show a special state or navigate
        if (res.data.intent === "SEND_FUNDS") {
          aiMsg.isTransaction = true;
          aiMsg.transactionParams = {
            type: 'transfer',
            amount: String(res.data.params.amount || "0"),
            token: String(res.data.params.token || "FLOW"),
            recipient: String(res.data.params.recipient || res.data.params.toAddress || "Unknown"),
          };
          aiMsg.transactionDetails = {
            label: "Transfer Intent",
            sent: `Amount: ${res.data.params.amount} ${res.data.params.token}`,
            to: `Recipient: ${res.data.params.recipient}`,
            result: "Tap to confirm and send",
          };
          setPendingTransaction(aiMsg.transactionParams);
        } else if (res.data.intent === "SWAP_TOKEN") {
          aiMsg.isTransaction = true;
          aiMsg.transactionParams = {
            type: 'swap',
            fromToken: String(res.data.params.fromToken || "FLOW"),
            toToken: String(res.data.params.toToken || "USDC"),
            fromAmount: String(res.data.params.fromAmount || "0"),
          };
          aiMsg.transactionDetails = {
            label: "Swap Intent",
            sent: `From: ${res.data.params.fromAmount} ${res.data.params.fromToken}`,
            to: `To: ${res.data.params.toToken}`,
            result: "Tap to confirm swap",
          };
          setPendingTransaction(aiMsg.transactionParams);
        }

        setMessages((prev) => [...prev, aiMsg]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            id: `err-${Date.now()}`,
            role: "ai",
            text: res.error || "Sorry, I encountered an error. Please try again.",
          },
        ]);
      }
    } catch (err) {
      setShowTyping(false);
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: "ai",
          text: "Network error. Please check your connection.",
        },
      ]);
    }
  }, [inputValue, enterThreadIfNeeded, resetVoice]);

  const handleVoiceSendFinal = useCallback(() => {
    setVoiceFlow("sending");
    window.setTimeout(() => {
      enterThreadIfNeeded();
      setMessages((prev) => [
        ...prev,
        {
          id: `v-${Date.now()}`,
          role: "user",
          text: "",
          isVoice: true,
          time: "2m ago",
        },
      ]);
      resetVoice();
      setScreen("chat-responding");
      setShowTyping(true);
      window.setTimeout(() => {
        setShowTyping(false);
        setMessages((prev) => [
          ...prev,
          {
            id: `a-${Date.now()}`,
            role: "ai",
            text: "Got it — I heard your voice note.",
          },
        ]);
      }, 1200);
    }, 1600);
  }, [enterThreadIfNeeded, resetVoice]);

  const handleConfirmTransaction = async (pin: string) => {
    if (!pendingTransaction) return;
    setConfirmProcessing(true);
    try {
      if (pendingTransaction.type === 'swap') {
        const res = await postSwap({
          fromToken: pendingTransaction.fromToken,
          toToken: pendingTransaction.toToken,
          fromAmount: pendingTransaction.fromAmount,
          pin,
        });
        setConfirmProcessing(false);
        setConfirmOpen(false);

        if (res.data?.success) {
          // Success swap logic
          setMessages(prev => prev.map(msg => {
            if (msg.role === 'ai' && msg.isTransaction && msg.transactionDetails?.label === "Swap Intent") {
              return {
                ...msg,
                transactionDetails: {
                  ...msg.transactionDetails,
                  result: "Swap Complete! 🔄",
                }
              };
            }
            return msg;
          }));

          const explorerUrl = `https://evm-testnet.flowscan.io/tx/${res.data.hash}`;
          setMessages(prev => [...prev, {
            id: `sw-suc-${Date.now()}`,
            role: "ai",
            text: `Swap complete! Your assets have been exchanged on PunchSwap. [View on Flowscan](${explorerUrl})`,
          }]);
        } else {
          alert(res.error || "Swap failed");
        }
      } else if (pendingTransaction.type === 'transfer') {
        const res = await postTransfer({
          to: pendingTransaction.recipient,
          amount: pendingTransaction.amount,
          token: pendingTransaction.token,
          pin,
        });
        setConfirmProcessing(false);
        setConfirmOpen(false);

        if (res.data?.success) {
          // Mark as sent
          setMessages(prev => prev.map(msg => {
            if (msg.role === 'ai' && msg.isTransaction && (msg.transactionDetails?.label === "Transfer Intent" || msg.transactionDetails?.label === "Schedule Intent")) {
              return {
                ...msg,
                transactionDetails: {
                  ...msg.transactionDetails,
                  result: "Transaction Sent! ✅",
                }
              };
            }
            return msg;
          }));

          const explorerUrl = `https://evm-testnet.flowscan.io/tx/${res.data.hash}`;
          setMessages(prev => [...prev, {
            id: `tx-suc-${Date.now()}`,
            role: "ai",
            text: `Payment sent! Your transaction has been recorded on the blockchain. [View on Flowscan](${explorerUrl})`,
          }]);
        } else {
          alert(res.error || "Transfer failed");
        }
      }
    } catch (err: any) {
      setConfirmProcessing(false);
      alert("Network error while processing transaction");
    }
  };

  const composerEl = (
    <ChatComposer
      value={inputValue}
      onChange={setInputValue}
      voiceFlow={voiceFlow}
      recordingTick={recordingTick}
      voicePreviewBars={voicePreviewBars}
      textAreaRef={textAreaRef}
      onDoc={() => { }}
      onMic={() => {
        if (inputValue.trim()) return;
        enterThreadIfNeeded();
        setRecordingTick(0);
        setVoiceFlow("recording");
      }}
      onTypingSend={handleSendText}
      onIdleSendClick={() => {
        if (inputValue.trim()) handleSendText();
      }}
      onRecordingCancel={resetVoice}
      onRecordingStopToPreview={() => {
        setVoicePreviewBars(barsFromRecordingTick(recordingTick));
        setVoiceFlow("preview");
      }}
      onPreviewCancel={resetVoice}
      onPreviewSend={handleVoiceSendFinal}
    />
  );

  const showHomeShell = screen === "welcome" || screen === "home";
  const showThread = screen === "chat-empty" || screen === "chat-responding";

  const renderMain = () => {
    if (showHomeShell) {
      return (
        <>
          <div className="chat-main-panel">
            {!hideHomeDiscover ? <ChatHomePanel onBack={() => navigate("/home")} onPromptClick={(p) => {

              setInputValue(p);
              setMessages([]);
              setShowTyping(false);
              setScreen("chat-empty");
              resetVoice();
            }} /> : <div className="chat-blank-main" aria-hidden />}
          </div>
          {composerEl}
        </>
      );
    }
    if (showThread) {
      return (
        <ChatScreen
          messages={messages}
          showTyping={showTyping}
          composer={composerEl}
          onBack={() => navigate("/home")}
          onTransactionClick={(msg) => {
            if (msg.transactionParams) {
              setPendingTransaction(msg.transactionParams);
              setConfirmOpen(true);
            }
          }}
        />
      );
    }
    if (screen === "voice-recording" || screen === "voice-processing") {
      return <VoiceScreen processing={screen === "voice-processing"} />;
    }
    return null;
  };

  return (
    <>
      <style>{`
        @keyframes jbounce{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}
        @keyframes vwave{from{transform:scaleY(0.3)}to{transform:scaleY(1)}}
        .ai-chat-root *{box-sizing:border-box}
        .ai-chat-messages::-webkit-scrollbar{width:4px}
        .ai-chat-messages::-webkit-scrollbar-thumb{background:#2A2A3A;border-radius:2px}
      `}</style>
      <div className="jumpa-theme-wrapper">
        <div className="phone-frame">
          <div
            className="app-content"
            style={{
              display: "flex",
              flexDirection: "column",
              minHeight: 0,
              height: "100%",
              overflow: "hidden",
            }}
          >
            <div className="ai-chat-root">
              <div className={showWelcomeOverlay ? "is-blurred" : ""} style={{ flex: 1, minHeight: 0, height: "100%", display: "flex", flexDirection: "column" }}>
                {renderMain()}
              </div>
              {showWelcomeOverlay && <WelcomeOverlay onClose={() => setScreen("home")} />}
              <TransactionConfirmDrawer
                open={confirmOpen}
                onOpenChange={setConfirmOpen}
                details={pendingTransaction}
                onConfirm={handleConfirmTransaction}
                processing={confirmProcessing}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
