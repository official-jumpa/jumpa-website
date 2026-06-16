"use client";
import {
  useState,
  useRef,
  useEffect,
  useLayoutEffect,
  useCallback,
} from "react";
import { getAiHistory, postAiIntent, postTransfer, postSwap, putAiHistory } from "@/lib/api";
import { useNavigate } from "@/lib/pages-adapter";
import TransactionConfirmDrawer, { type TransactionDetails } from "@/features/send/components/TransactionConfirmDrawer";
import OnrampSheet from "@/features/onramp/OnrampSheet";
import OfframpSheet from "@/features/offramp/OfframpSheet";
import {
  type Screen,
  type VoiceFlow,
  type Message,
} from "./chat-types";
import { backIcon, MAX_PENDING_CHAT_IMAGES } from "./chat-assets";
import { ChatComposer } from "./ChatComposer";
import { barsFromRecordingTick } from "./VoiceRecorderPanel";
import { VoiceScreen, IconBtn } from "./ChatHelpers";
import ChatMessageList from "./ChatMessageList";

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
    <div className="box-border w-full max-w-[390px] mx-auto pb-4 pt-0">
      <IconBtn
        onClick={onBack}
        ariaLabel="Back"
        className="ml-6 mt-[calc(90px+env(safe-area-inset-top,0))]"
      >
        <img src={backIcon} alt="" width={14} height={11} className="block object-contain" />
      </IconBtn>

      <header className="mt-6 ml-6 w-[293px] max-w-[calc(100%-48px)] flex flex-col gap-2">
        <div className="flex flex-col gap-0 min-h-[72px]">
          <p className="m-0 font-[Geist,sans-serif] font-bold text-2xl leading-9 tracking-[-0.41px] text-white">Hi Dear</p>
          <p className="m-0 font-[Geist,sans-serif] font-bold text-2xl leading-9 tracking-[-0.41px] text-white">Start your transactions..</p>
        </div>
        <p className="m-0 font-[Geist,sans-serif] font-normal text-sm leading-[145%] text-[#909090]">
          Prompt our Ai to make any transaction .
        </p>
      </header>

      <div className="w-[317px] max-w-[calc(100%-48px)] mt-[207px] ml-6 mr-auto mb-6 flex flex-col gap-2">
        {SUGGESTIONS.map((s, i) => (
          <button
            key={i}
            type="button"
            className="flex items-start gap-[14px] w-full min-h-[37px] cursor-pointer border-none bg-transparent p-0 text-left font-inherit hover:opacity-90 active:opacity-85"
            onClick={() => onPromptClick(s)}
          >
            <span className="w-3 h-3 rounded-full bg-[#6a59ce] shrink-0 mt-[11px]" aria-hidden />
            <div className="chat-suggestion-text-wrap flex-[0_1_auto] w-fit max-w-[min(calc(317px-14px-12px),calc(100%-26px))] min-w-0 pt-[10px] pb-[11px] box-border">
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

// ─── ChatScreen (AiChat-only, no invite btn)
function ChatScreen({
  messages,
  showTyping,
  composer,
  onBack,
  onTransactionClick,
  onOnrampInitiated,
}: {
  messages: Message[];
  showTyping: boolean;
  composer: React.ReactNode;
  onBack: () => void;
  onTransactionClick: (msg: Message) => void;
  onOnrampInitiated?: (msgId: string, reference: string, deposit: any) => void;
}) {
  return (
    <div className="flex-1 min-h-0 flex flex-col bg-black w-full max-w-[390px] mx-auto box-border">
      <header className="shrink-0 px-6 flex justify-between items-center">
        <IconBtn
          onClick={onBack}
          ariaLabel="Back"
          className="mt-[calc(90px+env(safe-area-inset-top,0))] ml-0"
        >
          <img src={backIcon} alt="" width={14} height={11} className="block object-contain" />
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
  const [onrampDraft, setOnrampDraft] = useState<{ amount: string; token: string; currency: string } | null>(null);
  const [offrampOpen, setOfframpOpen] = useState(false);
  const [offrampDraft, setOfframpDraft] = useState<{ amount: string; token: string } | null>(null);

  const [messages, setMessages] = useState<Message[]>([]);
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
  const [pendingAttachments, setPendingAttachments] = useState<{ id: string; url: string }[]>([]);
  const phoneFrameRef = useRef<HTMLDivElement>(null);
  const aiChatRootRef = useRef<HTMLDivElement>(null);
  const composerSectionRef = useRef<HTMLDivElement>(null);

  const updateComposerLayout = useCallback(() => {
    const frame = phoneFrameRef.current;
    const composer = composerSectionRef.current;
    const root = aiChatRootRef.current;
    if (!root) return;
    if (!composer) { root.style.setProperty("--ai-composer-spacer", "0px"); return; }

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

    root.style.setProperty("--ai-composer-spacer", `${Math.ceil(composer.getBoundingClientRect().height)}px`);
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
    const ro = typeof ResizeObserver !== "undefined" && composer ? new ResizeObserver(scheduleLayout) : null;
    if (composer && ro) ro.observe(composer);
    const mobileMq = window.matchMedia("(max-width: 768px)");
    const onMobileMq = () => scheduleLayout();
    if (typeof mobileMq.addEventListener === "function") mobileMq.addEventListener("change", onMobileMq);
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
      if (typeof mobileMq.removeEventListener === "function") mobileMq.removeEventListener("change", onMobileMq);
      else mobileMq.removeListener(onMobileMq);
    };
  }, [updateComposerLayout, screen, inputValue, voiceFlow, showTyping, messages.length, pendingAttachments.length]);

  const appendImageFiles = useCallback((files: FileList | null) => {
    if (!files?.length) return;
    const imgs = Array.from(files).filter((f) => f.type.startsWith("image/"));
    if (!imgs.length) return;
    setPendingAttachments((prev) => {
      const next = [...prev];
      for (const file of imgs) {
        if (next.length >= MAX_PENDING_CHAT_IMAGES) break;
        next.push({ id: `p-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`, url: URL.createObjectURL(file) });
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
    setPendingAttachments((prev) => { prev.forEach((p) => URL.revokeObjectURL(p.url)); return []; });
  }, []);

  useEffect(() => { if (inputValue.trim()) setAttachMenuOpen(false); }, [inputValue]);

  useEffect(() => {
    const fetchHistory = async () => {
      const res = await getAiHistory();
      if (res.data?.messages) {
        setMessages(res.data.messages);
        if (res.data.messages.length > 0) setScreen("chat-empty");
      }
    };
    fetchHistory();
  }, []);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmProcessing, setConfirmProcessing] = useState(false);
  const [pendingTransaction, setPendingTransaction] = useState<TransactionDetails | null>(null);

  // Persist reference + deposit data back into the message after onramp initiation
  // so that on page reload the card restores to the transfer step
  const handleOnrampInitiated = useCallback(async (msgId: string, reference: string, deposit: any) => {
    setMessages((prev) => {
      const updated = prev.map((m) =>
        m.id === msgId
          ? { ...m, transactionParams: { ...m.transactionParams, reference, depositData: deposit } }
          : m
      );
      // Fire-and-forget persist to backend
      putAiHistory(updated).catch((e) => console.error("[AiChat] Failed to persist onramp initiation:", e));
      return updated;
    });
  }, []);

  useEffect(() => {
    if (voiceFlow !== "recording") return;
    const id = window.setInterval(() => setRecordingTick((t) => t + 1), 110);
    return () => window.clearInterval(id);
  }, [voiceFlow]);

  const resetVoice = useCallback(() => { setVoiceFlow("none"); setRecordingTick(0); }, []);

  const hideHomeDiscover =
    screen === "chat-empty" ||
    screen === "chat-responding" ||
    (screen === "home" && (inputValue.length > 0 || voiceFlow !== "none" || pendingAttachments.length > 0));

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
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: true }),
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
        const aiMsg: Message = { id: `a-${Date.now()}`, role: "ai", text: res.data.message };

        if (res.data.intent === "SEND_FUNDS") {
          aiMsg.isTransaction = true;
          aiMsg.transactionParams = { type: "transfer", amount: String(res.data.params.amount || "0"), token: String(res.data.params.token || "SOL"), recipient: String(res.data.params.recipient || res.data.params.toAddress || "Unknown") };
          aiMsg.transactionDetails = { label: "Transfer Intent", title: "Pending Transfer", sent: `Amount: ${res.data.params.amount} ${res.data.params.token}`, to: `Recipient: ${res.data.params.recipient}`, result: "Tap to confirm and send" };
          setPendingTransaction(aiMsg.transactionParams);
        } else if (res.data.intent === "SWAP_TOKEN") {
          aiMsg.isTransaction = true;
          aiMsg.transactionParams = { type: "swap", fromToken: String(res.data.params.fromToken || "SOL"), toToken: String(res.data.params.toToken || "USDC"), fromAmount: String(res.data.params.fromAmount || "0") };
          aiMsg.transactionDetails = { label: "Swap Intent", title: "Drafted Swap", sent: `From: ${res.data.params.fromAmount} ${res.data.params.fromToken}`, to: `To: ${res.data.params.toToken}`, result: "Tap to confirm swap" };
          setPendingTransaction(aiMsg.transactionParams);
        } else if (res.data.intent === "ONRAMP_CRYPTO") {
          aiMsg.isTransaction = true;
          const fallbackToken = t.toLowerCase().includes("base") ? "base:usdc" : "solana:usdc";
          const targetToken = String(res.data.params.token || fallbackToken);
          aiMsg.transactionParams = { type: "onramp", amount: String(res.data.params.amount || ""), token: targetToken, currency: String(res.data.params.currency || "NGN") };
          aiMsg.transactionDetails = { label: "Buy Crypto Request", title: "Onramp Transaction", sent: res.data.params.currency && res.data.params.currency !== "NGN" ? `Crypto: ${res.data.params.amount} ${res.data.params.currency}` : `Spend: ${res.data.params.amount ? "₦" + res.data.params.amount : "₦0"}`, to: `Receive: ${targetToken}`, result: "Tap to review or change the amount" };
        } else if (res.data.intent === "OFFRAMP_CRYPTO") {
          aiMsg.isTransaction = true;
          const fallbackToken = t.toLowerCase().includes("base") ? "base:usdc" : "solana:usdc";
          const targetToken = String(res.data.params.token || fallbackToken);
          aiMsg.transactionParams = { type: "offramp", amount: String(res.data.params.amount || ""), token: targetToken };
          aiMsg.transactionDetails = { label: "Sell Crypto Request", title: "Offramp Transaction", sent: `Selling: ${res.data.params.amount} ${targetToken.toUpperCase()}`, to: "Receive: Naira (Bank)", result: "Tap to enter bank details and withdraw" };
        }

        setMessages((prev) => [...prev, aiMsg]);
      } else {
        setMessages((prev) => [...prev, { id: `err-${Date.now()}`, role: "ai", text: res.error || "Sorry, I encountered an error. Please try again." }]);
      }
    } catch {
      setShowTyping(false);
      setMessages((prev) => [...prev, { id: `err-${Date.now()}`, role: "ai", text: "Network error. Please check your connection." }]);
    }
  }, [inputValue, pendingAttachments, enterThreadIfNeeded, resetVoice]);

  const handleVoiceSendFinal = useCallback(() => {
    setVoiceFlow("sending");
    window.setTimeout(() => {
      enterThreadIfNeeded();
      setMessages((prev) => [...prev, { id: `v-${Date.now()}`, role: "user", text: "", isVoice: true, time: "2m ago" }]);
      resetVoice();
      setScreen("chat-responding");
      setShowTyping(true);
      window.setTimeout(() => {
        setShowTyping(false);
        setMessages((prev) => [...prev, { id: `a-${Date.now()}`, role: "ai", text: "Got it — I heard your voice note." }]);
      }, 1200);
    }, 1600);
  }, [enterThreadIfNeeded, resetVoice]);

  const handleConfirmTransaction = async (pin: string) => {
    if (!pendingTransaction) return;
    setConfirmProcessing(true);
    try {
      if (pendingTransaction.type === "swap") {
        const res = await postSwap({ fromToken: pendingTransaction.fromToken, toToken: pendingTransaction.toToken, fromAmount: pendingTransaction.fromAmount, pin });
        setConfirmProcessing(false);
        setConfirmOpen(false);
        const swapData = res.data;
        if (swapData && swapData.success) {
          const updated = messages.map((msg) => msg.role === "ai" && msg.isTransaction && msg.transactionDetails?.label === "Swap Intent" ? { ...msg, transactionDetails: { ...msg.transactionDetails, result: "Swap Complete! 🔄" } } : msg);
          const finalMsgs: Message[] = [...updated, { id: `sw-suc-${Date.now()}`, role: "ai", text: `Swap complete! Your assets have been exchanged on Jupiter. [View on Solscan](https://solscan.io/tx/${swapData.hash})` }];
          setMessages(finalMsgs);
          await putAiHistory(finalMsgs);
        } else { alert(res.error || "Swap failed"); }
      } else if (pendingTransaction.type === "transfer") {
        const res = await postTransfer({ to: pendingTransaction.recipient, amount: pendingTransaction.amount, token: pendingTransaction.token, pin });
        setConfirmProcessing(false);
        setConfirmOpen(false);
        const transferData = res.data;
        if (transferData && transferData.success) {
          const updated = messages.map((msg) => msg.role === "ai" && msg.isTransaction && (msg.transactionDetails?.label === "Transfer Intent" || msg.transactionDetails?.label === "Schedule Intent") ? { ...msg, transactionDetails: { ...msg.transactionDetails, result: "Transaction Sent! ✅" } } : msg);
          const finalMsgs: Message[] = [...updated, { id: `tx-suc-${Date.now()}`, role: "ai", text: `Payment sent! Your transaction has been recorded on the blockchain. [View on Solscan](https://solscan.io/tx/${transferData.hash})` }];
          setMessages(finalMsgs);
          await putAiHistory(finalMsgs);
        } else { alert(res.error || "Transfer failed"); }
      }
    } catch { setConfirmProcessing(false); alert("Network error while processing transaction"); }
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
      onIdleSendClick={() => { if (inputValue.trim() || pendingAttachments.length > 0) handleSendText(); }}
      onRecordingCancel={resetVoice}
      onRecordingConfirmSend={() => { setVoicePreviewBars(barsFromRecordingTick(recordingTick)); handleVoiceSendFinal(); }}
    />
  );

  const showHomeShell = screen === "home";
  const showThread = screen === "chat-empty" || screen === "chat-responding";

  const renderMain = () => {
    if (showHomeShell) {
      return (
        <div className="flex-1 min-h-0 flex flex-col w-full items-stretch">
          <div className="chat-main-panel flex-1 min-h-0 w-full max-w-[390px] mx-auto bg-black relative flex flex-col overflow-x-hidden overflow-y-auto">
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
              <div className="flex-1 min-h-[120px] bg-black" aria-hidden />
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
          composer={(!onrampOpen && !offrampOpen && !confirmOpen) ? composerEl : <div className="h-4" />}
          onBack={() => navigate("/home")}
          onOnrampInitiated={handleOnrampInitiated}
          onTransactionClick={(msg) => {
            if (msg.transactionParams) {
              if (msg.transactionParams.type === "onramp") {
                setOnrampDraft({ amount: msg.transactionParams.amount, token: msg.transactionParams.token, currency: msg.transactionParams.currency });
                setOnrampOpen(true);
              } else if (msg.transactionParams.type === "offramp") {
                setOfframpDraft({ amount: msg.transactionParams.amount, token: msg.transactionParams.token });
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
      <div className="w-full max-w-[450px] h-screen bg-[#171717] relative overflow-hidden mx-auto shadow-[0_0_40px_rgba(0,0,0,0.5)]" ref={phoneFrameRef}>
        <div className="app-content app-content--ai-chat flex flex-col min-h-0 h-full overflow-hidden">
          <div className="ai-chat-root relative flex flex-col flex-1 min-h-0 w-full h-full bg-black overflow-hidden">
            <div className="flex-1 min-h-0 flex flex-col h-full">
              {renderMain()}
            </div>
            <TransactionConfirmDrawer open={confirmOpen} onOpenChange={setConfirmOpen} details={pendingTransaction} onConfirm={handleConfirmTransaction} processing={confirmProcessing} />
            <OnrampSheet open={onrampOpen} onOpenChange={setOnrampOpen} defaultAmount={onrampDraft?.amount} defaultToken={onrampDraft?.token} defaultCurrency={onrampDraft?.currency} />
            <OfframpSheet open={offrampOpen} onOpenChange={setOfframpOpen} defaultAmount={offrampDraft?.amount} defaultToken={offrampDraft?.token} />
          </div>
        </div>
      </div>
    </div>
  );
}
