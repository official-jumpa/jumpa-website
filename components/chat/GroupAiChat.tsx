"use client";
import {
  useState,
  useRef,
  useEffect,
  useLayoutEffect,
  useCallback,
} from "react";
import { getAiHistory, postAiIntent, postTransfer, postSwap } from "@/lib/api";
import { useNavigate } from "@/lib/pages-adapter";
import TransactionConfirmDrawer, { type TransactionDetails } from "@/features/send/components/TransactionConfirmDrawer";
import "@/components/home/home.css";

import {
  type Screen,
  type VoiceFlow,
  type Message,
  backIcon,
  ChatComposer,
  VoiceScreen,
  UserBubble,
  UserMediaBubble,
  AiTextBlock,
  TransactionBlock,
  ThinkingRow,
  IconBtn,
  barsFromRecordingTick,
  MAX_PENDING_CHAT_IMAGES,
} from "./ChatShared";

const addUser = "/assets/icons/actions/add-user.svg";

function InviteModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;
  return (
    <div
      className="absolute inset-0 bg-black/50 z-[100] flex flex-col justify-end px-5 pb-10"
      onClick={onClose}
    >
      <div
        className="bg-[#E1DEF5] rounded-[20px] p-10 px-6 flex flex-col items-center gap-[14px]"
        onClick={(e) => e.stopPropagation()}
      >
        <img src="/assets/icons/invite.svg" alt="" className="w-[118px] h-[67px]" />
        <div className="flex flex-col gap-3 items-center w-full">
          <div className="flex flex-col gap-2 items-center">
            <h2 className="text-[32px] font-medium text-[#2D2D2D] m-0">Invite friends</h2>
            <p className="text-sm text-[#2D2D2D] text-center m-0 leading-[1.4]">
              Bring your friends along, splitting bills<br />has never been easier
            </p>
          </div>
          <div className="flex items-center bg-[#F0EEFA] rounded-xl p-[10px] w-full justify-between">
            <span className="text-[#6A59CE] text-xs">https://manee.34</span>
            <button type="button" className="bg-none border-none cursor-pointer p-0">
              <img src="/assets/icons/actions/clipboard-purple.svg" alt="Copy" className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── ChatHomePanel (GroupAiChat-only, has invite btn, no suggestions) ─────────
function ChatHomePanel({ onBack, onInviteClick }: { onBack: () => void; onInviteClick: () => void }) {
  return (
    <div className="box-border w-full max-w-[390px] mx-auto pb-4 pt-0">
      <div className="pr-6 flex items-center justify-between">
        <IconBtn
          onClick={onBack}
          ariaLabel="Back"
          className="ml-6 mt-[calc(90px+env(safe-area-inset-top,0px))]"
        >
          <img src={backIcon} alt="" width={14} height={11} className="block object-contain" />
        </IconBtn>
        <IconBtn
          onClick={onInviteClick}
          ariaLabel="Invite"
          className="mt-[calc(90px+env(safe-area-inset-top,0px))]"
        >
          <img src={addUser} alt="" width={23} height={23} className="block object-contain" />
        </IconBtn>
      </div>
      <header className="mt-6 ml-6 w-[293px] max-w-[calc(100%-48px)] flex flex-col gap-2">
        <div className="flex flex-col gap-0 min-h-[72px]">
          <p className="m-0 font-[Geist,sans-serif] font-bold text-2xl leading-9 tracking-[-0.41px] text-white">Hi Dear</p>
          <p className="m-0 font-[Geist,sans-serif] font-bold text-2xl leading-9 tracking-[-0.41px] text-white">Start your transactions..</p>
        </div>
        <p className="m-0 font-[Geist,sans-serif] font-normal text-sm leading-[145%] text-[#909090]">
          Prompt our Ai to make any transaction .
        </p>
      </header>
    </div>
  );
}

// ─── ChatScreen (GroupAiChat-only, has invite btn + other-user messages) ──────
function ChatScreen({
  messages,
  showTyping,
  composer,
  onBack,
  onInviteClick,
  onTransactionClick,
}: {
  messages: Message[];
  showTyping: boolean;
  composer: React.ReactNode;
  onBack: () => void;
  onInviteClick: () => void;
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
    <div className="flex-1 min-h-0 flex flex-col bg-black w-full max-w-[390px] mx-auto box-border">
      <header className="flex-shrink-0 px-6 flex justify-between items-center">
        <IconBtn
          onClick={onBack}
          ariaLabel="Back"
          className="mt-[calc(90px+env(safe-area-inset-top,0px))] ml-0"
        >
          <img src={backIcon} alt="" width={14} height={11} className="block object-contain" />
        </IconBtn>
        <IconBtn
          onClick={onInviteClick}
          ariaLabel="Invite"
          className="mt-[calc(90px+env(safe-area-inset-top,0px))]"
        >
          <img src={addUser} alt="" width={23} height={23} className="block object-contain" />
        </IconBtn>
      </header>

      <div className="ai-chat-messages flex-1 min-h-0 overflow-y-auto px-6 pt-3">
        {/* "Anita joined" system message */}
        <div className="flex justify-center mb-5">
          <div className="bg-[#2D2D2D] text-[#DFDFDF] px-[10px] py-[10px] rounded-xl text-sm font-normal">
            Anita joined
          </div>
        </div>

        {messages.map((m) =>
          m.isOtherUser ? (
            <div key={m.id} className="flex justify-start mb-5">
              <div className="bg-[#2D2D2D] text-[#D5D5D5] p-[10px] rounded-[18px] text-xs font-normal">
                {m.text}
              </div>
            </div>
          ) : (
            <div
              key={m.id}
              className={`mb-4 flex flex-col ${m.role === "user" ? "items-end" : "items-start"}`}
            >
              {m.role === "user" ? (
                m.imageUrls?.length
                  ? <UserMediaBubble imageUrls={m.imageUrls} text={m.text} />
                  : <UserBubble text={m.text} isVoice={m.isVoice} />
              ) : m.isTransaction ? (
                <TransactionBlock msg={m} onTransactionClick={onTransactionClick} />
              ) : (
                <AiTextBlock text={m.text} />
              )}
            </div>
          ),
        )}

        {showTyping && <ThinkingRow />}
        <div ref={endRef} />
      </div>

      {composer}
    </div>
  );
}

// ─── Main GroupAiChat component ───────────────────────────────────────────────
export default function GroupAiChat() {
  const navigate = useNavigate();
  const [screen, setScreen] = useState<Screen>("home");
  const [inviteOpen, setInviteOpen] = useState(false);

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
      if (isMobile) {
        composer.style.left = `${r.left}px`;
        composer.style.width = `${r.width}px`;
        composer.style.transform = "none";
        composer.style.maxWidth = "none";
      } else {
        const w = Math.min(390, r.width);
        composer.style.left = `${r.left + (r.width - w) / 2}px`;
        composer.style.width = `${w}px`;
        composer.style.transform = "none";
        composer.style.maxWidth = "none";
      }
    } else if (isMobile) {
      composer.style.left = "0";
      composer.style.width = "100%";
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

  useEffect(() => {
    if (voiceFlow !== "recording") return;
    const id = window.setInterval(() => setRecordingTick((t) => t + 1), 110);
    return () => window.clearInterval(id);
  }, [voiceFlow]);

  const resetVoice = useCallback(() => { setVoiceFlow("none"); setRecordingTick(0); }, []);
  const enterThreadIfNeeded = useCallback(() => { if (screen === "home") setScreen("chat-empty"); }, [screen]);

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
          aiMsg.transactionDetails = { label: "Transfer Intent", sent: `Amount: ${res.data.params.amount} ${res.data.params.token}`, to: `Recipient: ${res.data.params.recipient}`, result: "Tap to confirm and send" };
          setPendingTransaction(aiMsg.transactionParams);
        } else if (res.data.intent === "SWAP_TOKEN") {
          aiMsg.isTransaction = true;
          aiMsg.transactionParams = { type: "swap", fromToken: String(res.data.params.fromToken || "SOL"), toToken: String(res.data.params.toToken || "USDC"), fromAmount: String(res.data.params.fromAmount || "0") };
          aiMsg.transactionDetails = { label: "Swap Intent", sent: `From: ${res.data.params.fromAmount} ${res.data.params.fromToken}`, to: `To: ${res.data.params.toToken}`, result: "Tap to confirm swap" };
          setPendingTransaction(aiMsg.transactionParams);
        }

        setMessages((prev) => [...prev, aiMsg]);
      } else {
        setMessages((prev) => [...prev, { id: `err-${Date.now()}`, role: "ai", text: res.error || "Sorry, I encountered an error. Please try again." }]);
      }
    } catch {
      setShowTyping(false);
      setMessages((prev) => [...prev, { id: `err-${Date.now()}`, role: "ai", text: "Network error. Please check your connection." }]);
    }

    // Fake other-user reply
    setTimeout(() => {
      setMessages((prev) => [...prev, { id: `other-${Date.now()}`, role: "ai", text: "Yes Jumpa", isOtherUser: true }]);
    }, 3000);
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
          setMessages((prev) => prev.map((msg) => msg.role === "ai" && msg.isTransaction && msg.transactionDetails?.label === "Swap Intent" ? { ...msg, transactionDetails: { ...msg.transactionDetails, result: "Swap Complete! 🔄" } } : msg));
          setMessages((prev) => [...prev, { id: `sw-suc-${Date.now()}`, role: "ai", text: `Swap complete! [View on Solscan](https://solscan.io/tx/${swapData.hash})` }]);
        } else { alert(res.error || "Swap failed"); }
      } else if (pendingTransaction.type === "transfer") {
        const res = await postTransfer({ to: pendingTransaction.recipient, amount: pendingTransaction.amount, token: pendingTransaction.token, pin });
        setConfirmProcessing(false);
        setConfirmOpen(false);
        const transferData = res.data;
        if (transferData && transferData.success) {
          setMessages((prev) => prev.map((msg) => msg.role === "ai" && msg.isTransaction && (msg.transactionDetails?.label === "Transfer Intent" || msg.transactionDetails?.label === "Schedule Intent") ? { ...msg, transactionDetails: { ...msg.transactionDetails, result: "Transaction Sent! ✅" } } : msg));
          setMessages((prev) => [...prev, { id: `tx-suc-${Date.now()}`, role: "ai", text: `Payment sent! [View on Solscan](https://solscan.io/tx/${transferData.hash})` }]);
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

  const renderMain = () => {
    if (screen === "home") {
      return (
        <div className="flex-1 min-h-0 flex flex-col w-full items-stretch">
          <div className="chat-main-panel flex-1 min-h-0 w-full max-w-[390px] mx-auto bg-black relative flex flex-col overflow-x-hidden overflow-y-auto">
            <ChatHomePanel onBack={() => navigate("/home")} onInviteClick={() => setInviteOpen(true)} />
          </div>
          {composerEl}
        </div>
      );
    }
    if (screen === "voice-recording" || screen === "voice-processing") {
      return <VoiceScreen processing={screen === "voice-processing"} />;
    }
    return (
      <ChatScreen
        messages={messages}
        showTyping={showTyping}
        composer={composerEl}
        onBack={() => navigate("/home")}
        onInviteClick={() => setInviteOpen(true)}
        onTransactionClick={(msg) => {
          if (msg.transactionParams) { setPendingTransaction(msg.transactionParams); setConfirmOpen(true); }
        }}
      />
    );
  };

  return (
    <div className="jumpa-theme-wrapper">
      <div className="phone-frame" ref={phoneFrameRef}>
        <div className="app-content app-content--ai-chat flex flex-col min-h-0 h-full overflow-hidden">
          <div className="ai-chat-root relative flex flex-col flex-1 min-h-0 w-full h-full bg-black overflow-hidden">
            <div className="flex-1 min-h-0 flex flex-col h-full">
              {renderMain()}
            </div>
            <TransactionConfirmDrawer open={confirmOpen} onOpenChange={setConfirmOpen} details={pendingTransaction} onConfirm={handleConfirmTransaction} processing={confirmProcessing} />
            <InviteModal open={inviteOpen} onClose={() => setInviteOpen(false)} />
          </div>
        </div>
      </div>
    </div>
  );
}
