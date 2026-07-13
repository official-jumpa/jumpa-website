"use client";
import {
  useState,
  useRef,
  useEffect,
  useLayoutEffect,
  useCallback,
} from "react";
import {
  getAiHistory,
  createAiSession,
  postAiIntent,
  postTransfer,
  postSwap,
  putAiHistory,
} from "@/lib/api";
import { useHomeLayout } from "@/components/layouts/HomeLayout";
import { useNavigate } from "@/lib/pages-adapter";
import TransactionConfirmDrawer, {
  type TransactionDetails,
} from "@/features/send/components/TransactionConfirmDrawer";
import OnrampSheet from "@/features/onramp/OnrampSheet";
import OfframpSheet from "@/features/offramp/OfframpSheet";
import { SwitchBanks } from "@/lib/SwitchBanks";
import { type Screen, type VoiceFlow, type Message } from "./chat-types";
import { backIcon, MAX_PENDING_CHAT_IMAGES } from "./chat-assets";
import { ChatComposer } from "./ChatComposer";
import { barsFromRecordingTick } from "./VoiceRecorderPanel";
import { VoiceScreen, IconBtn } from "./ChatHelpers";
import ChatMessageList from "./ChatMessageList";

type SessionSummary = {
  sessionId: string;
  title: string;
  updatedAt: string;
  messageCount: number;
};

function formatRelativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function ChatSidebar({
  open,
  sessions,
  activeSessionId,
  onSelect,
  onNew,
  onClose,
}: {
  open: boolean;
  sessions: SessionSummary[];
  activeSessionId: string | null;
  onSelect: (id: string) => void;
  onNew: () => void;
  onClose: () => void;
}) {
  return (
    <>
      {/* Backdrop */}
      {open && (
        <div className="absolute inset-0 bg-black/60 z-40" onClick={onClose} />
      )}
      {/* Drawer */}
      <div
        className={`absolute top-0 left-0 h-full w-[72%] max-w-70 bg-[#111111] z-50 flex flex-col transition-transform duration-300 ease-in-out ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between px-4 pt-[calc(56px+env(safe-area-inset-top,0))] pb-4 border-b border-white/10">
          <span className="text-white font-semibold text-sm">Chats</span>
          <button
            onClick={onNew}
            className="flex items-center gap-1.5 text-xs text-[#7c5cfc] font-medium hover:text-violet-400 transition-colors"
            aria-label="New chat"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 5v14M5 12h14" />
            </svg>
            New
          </button>
        </div>
        <div className="flex-1 overflow-y-auto py-2">
          {sessions.length === 0 ? (
            <p className="text-[#8b8b93] text-xs text-center mt-8 px-4">
              No chats yet. Start a new one!
            </p>
          ) : (
            sessions.map((s) => (
              <button
                key={s.sessionId}
                onClick={() => {
                  onSelect(s.sessionId);
                  onClose();
                }}
                className={`w-full text-left px-4 py-3 transition-colors hover:bg-white/5 ${
                  s.sessionId === activeSessionId ? "bg-white/10" : ""
                }`}
              >
                <p
                  className={`text-sm truncate m-0 ${s.sessionId === activeSessionId ? "text-white font-medium" : "text-[#d0d0d0]"}`}
                >
                  {s.title}
                </p>
                <span className="text-[10px] text-[#8b8b93] mt-0.5 block">
                  {s.messageCount} msg{s.messageCount !== 1 ? "s" : ""} ·{" "}
                  {formatRelativeTime(s.updatedAt)}
                </span>
              </button>
            ))
          )}
        </div>
      </div>
    </>
  );
}

const SUGGESTIONS = [
  "How do i invest $100 ?",
  "Analyze my portfolio and suggest investment",
  "Purchase an iPhone",
  "Exchange $30 to USDC Sol",
  "Exchange $30 to USDC ETh",
];

function ChatHomePanel({
  onPromptClick,
  onBack,
}: {
  onPromptClick: (p: string) => void;
  onBack: () => void;
}) {
  return (
    <div className="box-border w-full max-w-97.5 mx-auto pb-4 pt-0">
      <IconBtn
        onClick={onBack}
        ariaLabel="Back"
        className="ml-6 mt-[calc(90px+env(safe-area-inset-top,0))]"
      >
        <img
          src={backIcon}
          alt=""
          width={14}
          height={11}
          className="block object-contain"
        />
      </IconBtn>

      <header className="mt-6 ml-6 w-73.25 max-w-[calc(100%-48px)] flex flex-col gap-2">
        <div className="flex flex-col gap-0 min-h-18">
          <p className="m-0 font-[Geist,sans-serif] font-bold text-2xl leading-9 tracking-[-0.41px] text-white">
            Hi Dear
          </p>
          <p className="m-0 font-[Geist,sans-serif] font-bold text-2xl leading-9 tracking-[-0.41px] text-white">
            Start your transactions..
          </p>
        </div>
        <p className="m-0 font-[Geist,sans-serif] font-normal text-sm leading-[145%] text-[#909090]">
          Prompt our Ai to make any transaction .
        </p>
      </header>

      <div className="w-79.25 max-w-[calc(100%-48px)] mt-51.75 ml-6 mr-auto mb-6 flex flex-col gap-2">
        {SUGGESTIONS.map((s, i) => (
          <button
            key={i}
            type="button"
            className="flex items-start gap-3.5 w-full min-h-9.25 cursor-pointer border-none bg-transparent p-0 text-left font-inherit hover:opacity-90 active:opacity-85"
            onClick={() => onPromptClick(s)}
          >
            <span
              className="w-3 h-3 rounded-full bg-[#6a59ce] shrink-0 mt-2.75"
              aria-hidden
            />
            <div className="chat-suggestion-text-wrap flex-[0_1_auto] w-fit max-w-[min(calc(317px-14px-12px),calc(100%-26px))] min-w-0 pt-2.5 pb-2.75 box-border">
              <p className="m-0 font-[Geist,sans-serif] font-normal text-xs leading-[145%] text-[#909090] block overflow-anywhere wrap-break-word">
                {s}
              </p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

function ChatScreen({
  messages,
  showTyping,
  composer,
  onBack,
  onMenuClick,
  onNewChat,
  onTransactionClick,
  onOnrampInitiated,
}: {
  messages: Message[];
  showTyping: boolean;
  composer: React.ReactNode;
  onBack: () => void;
  onMenuClick: () => void;
  onNewChat: () => void;
  onTransactionClick: (msg: Message) => void;
  onOnrampInitiated?: (msgId: string, reference: string, deposit: any) => void;
}) {
  return (
    <div className="flex-1 min-h-0 flex flex-col bg-black w-full max-w-97.5 mx-auto box-border">
      <header className="shrink-0 px-4 flex justify-between items-center">
        <div className="flex items-center gap-2 mt-[calc(90px+env(safe-area-inset-top,0))]">
          <IconBtn onClick={onBack} ariaLabel="Back" className="ml-0 mt-0">
            <img
              src={backIcon}
              alt=""
              width={14}
              height={11}
              className="block object-contain"
            />
          </IconBtn>
          <IconBtn
            onClick={onMenuClick}
            ariaLabel="Chat history"
            className="mt-0"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </IconBtn>
        </div>
        <IconBtn
          onClick={onNewChat}
          ariaLabel="New chat"
          className="mt-[calc(90px+env(safe-area-inset-top,0))]"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 5v14M5 12h14" />
          </svg>
        </IconBtn>
      </header>

      <ChatMessageList
        messages={messages}
        showTyping={showTyping}
        onTransactionClick={onTransactionClick}
        onOnrampInitiated={onOnrampInitiated}
      />

      {composer}
    </div>
  );
}

export default function AiChat() {
  const navigate = useNavigate();
  const [screen, setScreen] = useState<Screen>("home");

  const [onrampOpen, setOnrampOpen] = useState(false);
  const [onrampDraft, setOnrampDraft] = useState<{
    amount: string;
    token: string;
    currency: string;
  } | null>(null);
  const [offrampOpen, setOfframpOpen] = useState(false);
  const [offrampDraft, setOfframpDraft] = useState<{
    amount: string;
    token: string;
    currency?: string;
    bankName?: string;
    bankCode?: string;
    accountNumber?: string;
    accountName?: string;
  } | null>(null);
  const [activeOfframpMsgId, setActiveOfframpMsgId] = useState<string | null>(
    null,
  );

  const { balances } = useHomeLayout();
  const walletAddresses = balances?.addresses || null;

  const [messages, setMessages] = useState<Message[]>([]);

  // Multi-session state
  const [sessions, setSessions] = useState<SessionSummary[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const activeSessionIdRef = useRef<string | null>(null);

  useEffect(() => {
    activeSessionIdRef.current = activeSessionId;
  }, [activeSessionId]);

  const pendingHistoryUpdateRef = useRef<NodeJS.Timeout | null>(null);
  const latestMessagesRef = useRef<Message[]>([]);

  useEffect(() => {
    latestMessagesRef.current = messages;
  }, [messages]);

  useEffect(() => {
    return () => {
      if (pendingHistoryUpdateRef.current) {
        clearTimeout(pendingHistoryUpdateRef.current);
      }
    };
  }, []);

  const debouncedPutHistory = useCallback(() => {
    if (pendingHistoryUpdateRef.current) {
      clearTimeout(pendingHistoryUpdateRef.current);
    }
    pendingHistoryUpdateRef.current = setTimeout(async () => {
      const sessionId = activeSessionIdRef.current;
      if (sessionId) {
        await putAiHistory(latestMessagesRef.current, sessionId).catch((e) =>
          console.error("[AiChat] Failed to persist updates:", e),
        );
        // Refresh session list to pick up updated titles and counts
        const res = await getAiHistory().catch(() => null);
        if (res?.data?.sessions) setSessions(res.data.sessions);
      }
      pendingHistoryUpdateRef.current = null;
    }, 1000);
  }, []);
  const [showTyping, setShowTyping] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [voiceFlow, setVoiceFlow] = useState<VoiceFlow>("none");
  const [recordingTick, setRecordingTick] = useState(0);
  const [voicePreviewBars, setVoicePreviewBars] = useState(8);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const filesInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const photosInputRef = useRef<HTMLInputElement>(null);
  const [attachMenuOpen, setAttachMenuOpen] = useState(false);
  const [pendingAttachments, setPendingAttachments] = useState<
    { id: string; url: string }[]
  >([]);
  const phoneFrameRef = useRef<HTMLDivElement>(null);
  const aiChatRootRef = useRef<HTMLDivElement>(null);
  const composerSectionRef = useRef<HTMLDivElement>(null);

  const updateComposerLayout = useCallback(() => {
    const frame = phoneFrameRef.current;
    const composer = composerSectionRef.current;
    const root = aiChatRootRef.current;
    if (!root) return;
    if (!composer) {
      root.style.setProperty("--ai-composer-spacer", "0px");
      return;
    }

    const isMobile = window.matchMedia("(max-width: 768px)").matches;
    const vv = window.visualViewport;
    let keyboard = 0;
    if (isMobile && vv != null) {
      const calculated = window.innerHeight - vv.offsetTop - vv.height;
      keyboard = Math.max(0, Math.min(calculated, window.innerHeight * 0.5));
    }
    composer.style.setProperty("--ai-composer-keyboard-inset", `${keyboard}px`);

    if (frame) {
      const r = frame.getBoundingClientRect();
      const w = Math.min(390, r.width);
      composer.style.left = `${r.left + (r.width - w) / 2}px`;
      composer.style.width = `${w}px`;
      composer.style.transform = "none";
      composer.style.maxWidth = "none";
    } else if (isMobile) {
      const w = Math.min(390, window.innerWidth);
      composer.style.left = `${(window.innerWidth - w) / 2}px`;
      composer.style.width = `${w}px`;
      composer.style.maxWidth = "none";
      composer.style.transform = "none";
    } else {
      composer.style.left = "50%";
      composer.style.width = "";
      composer.style.maxWidth = "390px";
      composer.style.transform = "translateX(-50%)";
    }

    root.style.setProperty(
      "--ai-composer-spacer",
      `${Math.ceil(composer.getBoundingClientRect().height)}px`,
    );
  }, []);

  useLayoutEffect(() => {
    const composer = composerSectionRef.current;
    const vv = window.visualViewport;
    let raf = 0;
    const scheduleLayout = () => {
      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        raf = 0;
        updateComposerLayout();
        const messagesEl = document.querySelector(".ai-chat-messages");
        if (messagesEl) {
          messagesEl.scrollTop = messagesEl.scrollHeight;
        }
      });
    };
    const ro =
      typeof ResizeObserver !== "undefined" && composer
        ? new ResizeObserver(scheduleLayout)
        : null;
    if (composer && ro) ro.observe(composer);
    const mobileMq = window.matchMedia("(max-width: 768px)");
    const onMobileMq = () => scheduleLayout();
    if (typeof mobileMq.addEventListener === "function")
      mobileMq.addEventListener("change", onMobileMq);
    else mobileMq.addListener(onMobileMq);
    vv?.addEventListener("resize", scheduleLayout);
    vv?.addEventListener("scroll", scheduleLayout);
    window.addEventListener("resize", scheduleLayout);
    scheduleLayout();
    return () => {
      if (raf) cancelAnimationFrame(raf);
      ro?.disconnect();
      vv?.removeEventListener("resize", scheduleLayout);
      vv?.removeEventListener("scroll", scheduleLayout);
      window.removeEventListener("resize", scheduleLayout);
      if (typeof mobileMq.removeEventListener === "function")
        mobileMq.removeEventListener("change", onMobileMq);
      else mobileMq.removeListener(onMobileMq);
    };
  }, [
    updateComposerLayout,
    screen,
    inputValue,
    voiceFlow,
    showTyping,
    messages.length,
    pendingAttachments.length,
  ]);

  const appendImageFiles = useCallback((files: FileList | null) => {
    if (!files?.length) return;
    const imgs = Array.from(files).filter((f) => f.type.startsWith("image/"));
    if (!imgs.length) return;
    setPendingAttachments((prev) => {
      const next = [...prev];
      for (const file of imgs) {
        if (next.length >= MAX_PENDING_CHAT_IMAGES) break;
        next.push({
          id: `p-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
          url: URL.createObjectURL(file),
        });
      }
      return next;
    });
  }, []);

  const removePendingAttachment = useCallback((id: string) => {
    setPendingAttachments((prev) => {
      const hit = prev.find((p) => p.id === id);
      if (hit) URL.revokeObjectURL(hit.url);
      return prev.filter((p) => p.id !== id);
    });
  }, []);

  const clearAllPendingAttachments = useCallback(() => {
    setPendingAttachments((prev) => {
      prev.forEach((p) => URL.revokeObjectURL(p.url));
      return [];
    });
  }, []);

  useEffect(() => {
    if (inputValue.trim()) setAttachMenuOpen(false);
  }, [inputValue]);

  useEffect(() => {
    const initSessions = async () => {
      // Load session list
      const res = await getAiHistory();
      const sessionList = res.data?.sessions || [];
      setSessions(sessionList);

      if (sessionList.length > 0) {
        // Auto-open the most recent session
        const latest = sessionList[0];
        setActiveSessionId(latest.sessionId);
        const msgRes = await getAiHistory(latest.sessionId);
        if (msgRes.data?.messages && msgRes.data.messages.length > 0) {
          setMessages(msgRes.data.messages);
          setScreen("chat-empty");
        }
      } else {
        // No sessions yet — create a fresh one silently
        const created = await createAiSession();
        if (created.data?.sessionId) {
          const newSession: SessionSummary = {
            sessionId: created.data.sessionId,
            title: "New Chat",
            updatedAt: new Date().toISOString(),
            messageCount: 0,
          };
          setSessions([newSession]);
          setActiveSessionId(created.data.sessionId);
        }
      }
    };
    initSessions();
  }, []);

  const handleNewChat = useCallback(async () => {
    setSidebarOpen(false);
    const created = await createAiSession();
    if (created.data?.sessionId) {
      const newSession: SessionSummary = {
        sessionId: created.data.sessionId,
        title: "New Chat",
        updatedAt: new Date().toISOString(),
        messageCount: 0,
      };
      setSessions((prev) => [newSession, ...prev]);
      setActiveSessionId(created.data.sessionId);
      setMessages([]);
      setScreen("home");
      setInputValue("");
      setShowTyping(false);
    }
  }, []);

  const handleSelectSession = useCallback(
    async (sessionId: string) => {
      if (sessionId === activeSessionId) return;
      setActiveSessionId(sessionId);
      setMessages([]);
      setScreen("chat-empty");
      const res = await getAiHistory(sessionId);
      if (res.data?.messages) {
        setMessages(res.data.messages);
      }
    },
    [activeSessionId],
  );

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmProcessing, setConfirmProcessing] = useState(false);
  const [confirmError, setConfirmError] = useState<string | null>(null);
  const [pendingTransaction, setPendingTransaction] =
    useState<TransactionDetails | null>(null);

  const handleOfframpBeneficiaryChange = useCallback(
    (bankCode: string, accountNumber: string, accountName: string) => {
      const selectedBank = SwitchBanks.find((b) => b.code === bankCode);
      const bankName = selectedBank ? selectedBank.name : "";

      setOfframpDraft((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          bankCode,
          bankName,
          accountNumber,
          accountName,
        };
      });

      if (activeOfframpMsgId) {
        setMessages((prev) => {
          const updated = prev.map((m) => {
            if (m.id !== activeOfframpMsgId) return m;
            const params = {
              ...m.transactionParams,
              bankCode,
              bankName,
              accountNumber,
              accountName,
            };
            const isNgn = params.currency === "NGN";
            const displaySent = isNgn
              ? `Amount: ₦${Number(params.amount).toLocaleString()}`
              : `Selling: ${params.amount} ${params.token.split(":")[1]?.toUpperCase()}`;
            const displayTo = accountNumber
              ? `To: ${accountName ? accountName + " (" + bankName + ")" : bankName} - ${accountNumber}`
              : "To: Naira (Bank)";

            return {
              ...m,
              transactionParams: params,
              transactionDetails: {
                ...m.transactionDetails,
                sent: displaySent,
                to: displayTo,
                result: accountNumber
                  ? "Tap to confirm withdrawal"
                  : "Tap to enter bank details and withdraw",
              },
            } as Message;
          });

          // Debounced persist to backend
          debouncedPutHistory();
          return updated;
        });
      }
    },
    [activeOfframpMsgId, debouncedPutHistory],
  );

  // Persist reference + deposit data back into the message after onramp initiation
  // so that on page reload the card restores to the transfer step
  const handleOnrampInitiated = useCallback(
    async (msgId: string, reference: string, deposit: any) => {
      setMessages((prev) => {
        const updated = prev.map((m) =>
          m.id === msgId
            ? {
                ...m,
                transactionParams: {
                  ...m.transactionParams,
                  reference,
                  depositData: deposit,
                },
              }
            : m,
        );
        const sessionId = activeSessionIdRef.current;
        if (sessionId) {
          putAiHistory(updated, sessionId).catch((e) =>
            console.error("[AiChat] Failed to persist onramp initiation:", e),
          );
        }
        return updated;
      });
    },
    [],
  );

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
    (screen === "home" &&
      (inputValue.length > 0 ||
        voiceFlow !== "none" ||
        pendingAttachments.length > 0));

  const enterThreadIfNeeded = useCallback(() => {
    if (screen === "home") setScreen("chat-empty");
  }, [screen]);

  const handleSendText = useCallback(async () => {
    const t = inputValue.trim();
    const imageUrls = pendingAttachments.map((p) => p.url);
    if (!t && imageUrls.length === 0) return;

    enterThreadIfNeeded();
    setAttachMenuOpen(false);
    const userMsg: Message = {
      id: `u-${Date.now()}`,
      role: "user",
      text: t,
      ...(imageUrls.length > 0 ? { imageUrls: [...imageUrls] } : {}),
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue("");
    setPendingAttachments([]);
    resetVoice();
    setScreen("chat-responding");
    setShowTyping(true);

    try {
      const res = await postAiIntent(t || "User shared image(s).");
      setShowTyping(false);

      if (res.data) {
        const aiMsg: Message = {
          id: `a-${Date.now()}`,
          role: "ai",
          text: res.data.message,
        };

        if (res.data.intent === "SEND_FUNDS") {
          aiMsg.isTransaction = true;
          aiMsg.transactionParams = {
            type: "transfer",
            amount: String(res.data.params.amount || "0"),
            token: String(res.data.params.token || "SOL"),
            recipient: String(
              res.data.params.recipient ||
                res.data.params.toAddress ||
                "Unknown",
            ),
          };
          aiMsg.transactionDetails = {
            label: "Transfer Intent",
            title: "Pending Transfer",
            sent: `Amount: ${res.data.params.amount} ${res.data.params.token}`,
            to: `Recipient: ${res.data.params.recipient}`,
            result: "Tap to confirm and send",
          };
          setPendingTransaction(aiMsg.transactionParams);
        } else if (res.data.intent === "SWAP_TOKEN") {
          aiMsg.isTransaction = true;
          aiMsg.transactionParams = {
            type: "swap",
            fromToken: String(res.data.params.fromToken || "SOL"),
            toToken: String(res.data.params.toToken || "USDC"),
            fromAmount: String(res.data.params.fromAmount || "0"),
          };
          aiMsg.transactionDetails = {
            label: "Swap Intent",
            title: "Drafted Swap",
            sent: `From: ${res.data.params.fromAmount} ${res.data.params.fromToken}`,
            to: `To: ${res.data.params.toToken}`,
            result: "Tap to confirm swap",
          };
          setPendingTransaction(aiMsg.transactionParams);
        } else if (res.data.intent === "ONRAMP_CRYPTO") {
          aiMsg.isTransaction = true;
          const fallbackToken = t.toLowerCase().includes("base")
            ? "base:usdc"
            : "solana:usdc";
          const targetToken = String(res.data.params.token || fallbackToken);
          aiMsg.transactionParams = {
            type: "onramp",
            amount: String(res.data.params.amount || ""),
            token: targetToken,
            currency: String(res.data.params.currency || "NGN"),
          };
          aiMsg.transactionDetails = {
            label: "Buy Asset",
            title: "Onramp Transaction",
            sent:
              res.data.params.currency && res.data.params.currency !== "NGN"
                ? `Crypto: ${res.data.params.amount} ${res.data.params.currency}`
                : `Spend: ${res.data.params.amount ? "₦" + res.data.params.amount : "₦0"}`,
            to: `Receive: ${targetToken}`,
            result: "Tap to review or change the amount",
          };

          const chain = targetToken.split(":")[0];
          const symbolKey =
            chain === "solana" ? "sol" : chain === "stellar" ? "xlm" : "base";
          const userAddress =
            walletAddresses?.[symbolKey as keyof typeof walletAddresses] || "";
          if (userAddress) {
            aiMsg.text =
              aiMsg.text + `\n\nReceiving Wallet Address: ${userAddress}`;
          }
        } else if (res.data.intent === "OFFRAMP_CRYPTO") {
          aiMsg.isTransaction = true;
          const fallbackToken = t.toLowerCase().includes("base")
            ? "base:usdc"
            : "solana:usdc";
          const targetToken = String(res.data.params.token || fallbackToken);

          const bankName = res.data.params.bankName || "";
          const bankCode = res.data.params.bankCode || "";
          const accountNumber = res.data.params.accountNumber || "";
          const accountName = res.data.params.accountName || "";
          const currency = res.data.params.currency || "USD";

          aiMsg.transactionParams = {
            type: "offramp",
            amount: String(res.data.params.amount || ""),
            token: targetToken,
            currency,
            bankName,
            bankCode,
            accountNumber,
            accountName,
          };

          const isNgn = currency === "NGN";
          const displaySent = isNgn
            ? `Amount: ₦${Number(res.data.params.amount).toLocaleString()}`
            : `Selling: ${res.data.params.amount} ${targetToken.split(":")[1]?.toUpperCase()}`;
          const displayTo = accountNumber
            ? `To: ${accountName ? accountName + " (" + bankName + ")" : bankName} - ${accountNumber}`
            : "To: Naira (Bank)";

          aiMsg.transactionDetails = {
            label: "Sell Asset",
            title: "Offramp Transaction",
            sent: displaySent,
            to: displayTo,
            result: accountNumber
              ? "Tap to confirm withdrawal"
              : "Tap to enter bank details and withdraw",
          };

          const chain = targetToken.split(":")[0];
          const symbolKey =
            chain === "solana" ? "sol" : chain === "stellar" ? "xlm" : "base";
          const userAddress =
            walletAddresses?.[symbolKey as keyof typeof walletAddresses] || "";
          if (userAddress) {
            aiMsg.text =
              aiMsg.text + `\n\nSource Wallet Address: ${userAddress}`;
          }
        }

        setMessages((prev) => [...prev, aiMsg]);
        debouncedPutHistory();
      } else {
        setMessages((prev) => [
          ...prev,
          {
            id: `err-${Date.now()}`,
            role: "ai",
            text:
              res.error || "Sorry, I encountered an error. Please try again.",
          },
        ]);
      }
    } catch {
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
  }, [
    inputValue,
    pendingAttachments,
    enterThreadIfNeeded,
    resetVoice,
    debouncedPutHistory,
    walletAddresses,
  ]);

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

  const getExplorerUrl = (token: string, hash: string) => {
    const t = token.toUpperCase();
    if (t.includes("SOL-DEV"))
      return `https://solscan.io/tx/${hash}?cluster=devnet`;
    if (t.includes("SOL")) return `https://solscan.io/tx/${hash}`;
    if (
      t.includes("SEP") ||
      t.includes("ETH-SEP") ||
      t.includes("USDC-SEP") ||
      t.includes("USDT-SEP")
    )
      return `https://sepolia.basescan.org/tx/${hash}`;
    if (
      t.includes("BASE") ||
      t.includes("ETH-BASE") ||
      t.includes("USDC-BASE") ||
      t.includes("USDT-BASE")
    )
      return `https://basescan.org/tx/${hash}`;
    if (t.includes("TEST") || t.includes("XLM-TEST"))
      return `https://stellar.expert/explorer/testnet/tx/${hash}`;
    if (t.includes("XLM"))
      return `https://stellar.expert/explorer/public/tx/${hash}`;
    return `https://solscan.io/tx/${hash}`;
  };

  const getExplorerLabel = (token: string) => {
    const t = token.toUpperCase();
    if (t.includes("SOL")) return "Solscan";
    if (t.includes("SEP") || t.includes("BASE") || t.includes("ETH"))
      return "BaseScan";
    if (t.includes("XLM")) return "Stellar Expert";
    return "Explorer";
  };

  const handleConfirmTransaction = async (pin: string) => {
    if (!pendingTransaction) return;
    setConfirmProcessing(true);
    setConfirmError(null);
    try {
      if (pendingTransaction.type === "swap") {
        const res = await postSwap({
          fromToken: pendingTransaction.fromToken,
          toToken: pendingTransaction.toToken,
          fromAmount: pendingTransaction.fromAmount,
          pin,
        });
        setConfirmProcessing(false);
        const swapData = res.data;
        if (swapData && swapData.success) {
          setConfirmOpen(false);
          const updated = messages.map((msg) =>
            msg.role === "ai" &&
            msg.isTransaction &&
            msg.transactionDetails?.label === "Swap Intent"
              ? {
                  ...msg,
                  transactionDetails: {
                    ...msg.transactionDetails,
                    result: "Swap Complete! 🔄",
                  },
                }
              : msg,
          );
          const explorerUrl = getExplorerUrl(
            pendingTransaction.fromToken,
            swapData.hash,
          );
          const explorerLabel = getExplorerLabel(pendingTransaction.fromToken);
          const sessionId = activeSessionIdRef.current;
          if (sessionId) {
            const finalMsgs: Message[] = [
              ...updated,
              {
                id: `sw-suc-${Date.now()}`,
                role: "ai",
                text: `Swap complete! Your assets have been exchanged on Jupiter. [View on ${explorerLabel}](${explorerUrl})`,
              },
            ];
            setMessages(finalMsgs);
            await putAiHistory(finalMsgs, sessionId);
          }
        } else {
          setConfirmError(res.error || "Swap failed");
        }
      } else if (pendingTransaction.type === "transfer") {
        const res = await postTransfer({
          to: pendingTransaction.recipient,
          amount: pendingTransaction.amount,
          token: pendingTransaction.token,
          pin,
        });
        setConfirmProcessing(false);
        const transferData = res.data;
        if (transferData && transferData.success) {
          setConfirmOpen(false);
          const updated = messages.map((msg) =>
            msg.role === "ai" &&
            msg.isTransaction &&
            (msg.transactionDetails?.label === "Transfer Intent" ||
              msg.transactionDetails?.label === "Schedule Intent")
              ? {
                  ...msg,
                  transactionDetails: {
                    ...msg.transactionDetails,
                    result: "Transaction Sent! ✅",
                  },
                }
              : msg,
          );
          const explorerUrl = getExplorerUrl(
            pendingTransaction.token,
            transferData.hash,
          );
          const explorerLabel = getExplorerLabel(pendingTransaction.token);
          const sessionId = activeSessionIdRef.current;
          if (sessionId) {
            const finalMsgs: Message[] = [
              ...updated,
              {
                id: `tx-suc-${Date.now()}`,
                role: "ai",
                text: `Transaction successful! [View on ${explorerLabel}](${explorerUrl})`,
              },
            ];
            setMessages(finalMsgs);
            await putAiHistory(finalMsgs, sessionId);
          }
        } else {
          setConfirmError(res.error || "Transfer failed");
        }
      }
    } catch {
      setConfirmProcessing(false);
      setConfirmError("Network error while processing transaction");
    }
  };

  const composerEl = (
    <ChatComposer
      ref={composerSectionRef}
      value={inputValue}
      onChange={setInputValue}
      voiceFlow={voiceFlow}
      recordingTick={recordingTick}
      voicePreviewBars={voicePreviewBars}
      textAreaRef={textAreaRef}
      filesInputRef={filesInputRef}
      cameraInputRef={cameraInputRef}
      photosInputRef={photosInputRef}
      attachMenuOpen={attachMenuOpen}
      onAttachToggle={() => setAttachMenuOpen((o) => !o)}
      onAttachClose={() => setAttachMenuOpen(false)}
      pendingAttachmentPreviews={pendingAttachments}
      onRemovePendingAttachment={removePendingAttachment}
      onImageFilesSelected={appendImageFiles}
      onMic={() => {
        if (inputValue.trim() || pendingAttachments.length > 0) return;
        setAttachMenuOpen(false);
        enterThreadIfNeeded();
        setRecordingTick(0);
        setVoiceFlow("recording");
      }}
      onTypingSend={handleSendText}
      onIdleSendClick={() => {
        if (inputValue.trim() || pendingAttachments.length > 0)
          handleSendText();
      }}
      onRecordingCancel={resetVoice}
      onRecordingConfirmSend={() => {
        setVoicePreviewBars(barsFromRecordingTick(recordingTick));
        handleVoiceSendFinal();
      }}
    />
  );

  const showHomeShell = screen === "home";
  const showThread = screen === "chat-empty" || screen === "chat-responding";

  const renderMain = () => {
    if (showHomeShell) {
      return (
        <div className="flex-1 min-h-0 flex flex-col w-full items-stretch">
          <div className="chat-main-panel flex-1 min-h-0 w-full max-w-97.5 mx-auto bg-black relative flex flex-col overflow-x-hidden overflow-y-auto">
            {!hideHomeDiscover ? (
              <ChatHomePanel
                onBack={() => navigate("/home")}
                onPromptClick={(p) => {
                  clearAllPendingAttachments();
                  setInputValue(p);
                  setMessages([]);
                  setShowTyping(false);
                  setScreen("chat-empty");
                  resetVoice();
                }}
              />
            ) : (
              <div className="flex-1 min-h-30 bg-black" aria-hidden />
            )}
          </div>
          {!onrampOpen && !offrampOpen && !confirmOpen && composerEl}
        </div>
      );
    }
    if (showThread) {
      return (
        <ChatScreen
          messages={messages}
          showTyping={showTyping}
          composer={
            !onrampOpen && !offrampOpen && !confirmOpen ? (
              composerEl
            ) : (
              <div className="h-4" />
            )
          }
          onBack={() => navigate("/home")}
          onMenuClick={() => setSidebarOpen(true)}
          onNewChat={handleNewChat}
          onOnrampInitiated={handleOnrampInitiated}
          onTransactionClick={(msg) => {
            if (msg.transactionParams) {
              setConfirmError(null);
              if (msg.transactionParams.type === "onramp") {
                setOnrampDraft({
                  amount: msg.transactionParams.amount,
                  token: msg.transactionParams.token,
                  currency: msg.transactionParams.currency,
                });
                setOnrampOpen(true);
              } else if (msg.transactionParams.type === "offramp") {
                setActiveOfframpMsgId(msg.id);
                setOfframpDraft({
                  amount: msg.transactionParams.amount,
                  token: msg.transactionParams.token,
                  currency: msg.transactionParams.currency,
                  bankName: msg.transactionParams.bankName,
                  bankCode: msg.transactionParams.bankCode,
                  accountNumber: msg.transactionParams.accountNumber,
                  accountName: msg.transactionParams.accountName,
                });
                setOfframpOpen(true);
              } else {
                setPendingTransaction(msg.transactionParams);
                setConfirmOpen(true);
              }
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
    <div className="flex justify-center items-center min-h-screen bg-black font-sans text-[#f3f3f5]">
      <div
        className="w-full max-w-112.5 h-screen bg-[#171717] relative overflow-hidden mx-auto shadow-[0_0_40px_rgba(0,0,0,0.5)]"
        ref={phoneFrameRef}
      >
        <div className="app-content app-content--ai-chat flex flex-col min-h-0 h-full overflow-hidden">
          <div className="ai-chat-root relative flex flex-col flex-1 min-h-0 w-full h-full bg-black overflow-hidden">
            <ChatSidebar
              open={sidebarOpen}
              sessions={sessions}
              activeSessionId={activeSessionId}
              onSelect={handleSelectSession}
              onNew={handleNewChat}
              onClose={() => setSidebarOpen(false)}
            />
            <div className="flex-1 min-h-0 flex flex-col h-full">
              {renderMain()}
            </div>
            <TransactionConfirmDrawer
              open={confirmOpen}
              onOpenChange={(open) => {
                setConfirmOpen(open);
                if (!open) setConfirmError(null);
              }}
              details={pendingTransaction}
              onConfirm={handleConfirmTransaction}
              processing={confirmProcessing}
              error={confirmError || undefined}
            />
            <OnrampSheet
              open={onrampOpen}
              onOpenChange={setOnrampOpen}
              defaultAmount={onrampDraft?.amount}
              defaultToken={onrampDraft?.token}
              defaultCurrency={onrampDraft?.currency}
            />
            <OfframpSheet
              open={offrampOpen}
              onOpenChange={(open) => {
                setOfframpOpen(open);
                if (!open) setActiveOfframpMsgId(null);
              }}
              defaultAmount={offrampDraft?.amount}
              defaultToken={offrampDraft?.token}
              defaultCurrency={offrampDraft?.currency}
              defaultBankCode={offrampDraft?.bankCode}
              defaultAccountNumber={offrampDraft?.accountNumber}
              defaultAccountName={offrampDraft?.accountName}
              onBeneficiaryChange={handleOfframpBeneficiaryChange}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
