"use client"
import {
  useState,
  useRef,
  useEffect,
  useLayoutEffect,
  useCallback,
  forwardRef,
  type RefObject,
  type ReactNode,
} from "react";
import { getAiHistory, postAiIntent, postTransfer, postSwap } from "@/lib/api";
import { useNavigate } from "@/lib/pages-adapter";
import TransactionConfirmDrawer, { type TransactionDetails } from "@/features/send/components/TransactionConfirmDrawer";
import OnrampSheet from "@/features/onramp/OnrampSheet";
import OfframpSheet from "@/features/offramp/OfframpSheet";
import "@/lib/pages/home/home.css";
import "./AiChat.css";

const backIcon = "/assets/icons/actions/back.svg";
const docIcon = "/assets/icons/actions/doc.svg";
const docActiveIcon = "/assets/icons/actions/doc-active.svg";
const fileMenuIcon = "/assets/icons/actions/file.svg";
const cameraMenuIcon = "/assets/icons/actions/camera.svg";
const photoMenuIcon = "/assets/icons/actions/photo.svg";
const voiceIcon = "/assets/icons/actions/voice%20copy.svg";
const sendBtnIcon = "/assets/icons/actions/sendbtn.svg";

const COMPOSER_ACTION_IMG = { width: 37, height: 29 } as const;
const vnIcon = '/assets/icons/actions/vn.svg';
const cancelVnIcon = '/assets/icons/actions/cancel-vn.svg';
const confirmVnIcon = '/assets/icons/actions/confirm-vn.svg';
const processVnIcon = '/assets/icons/actions/process.svg';

const MAX_PENDING_CHAT_IMAGES = 8;

type Screen =
  | "home"
  | "chat-empty"
  | "chat-responding"
  | "voice-recording"
  | "voice-processing";

type VoiceFlow = "none" | "recording" | "sending";

interface Message {
  id: string;
  role: "user" | "ai";
  text: string;
  /** Object URLs for images attached to this user message */
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
}

/** First paragraph as heading when split by \\n\\n and heading is reasonably short */
function splitAiMessage(text: string): { heading: string | null; body: string } {
  const t = text.trim();
  const idx = t.indexOf("\n\n");
  if (idx === -1) return { heading: null, body: t };
  const head = t.slice(0, idx).trim();
  const body = t.slice(idx + 2).trim();
  if (!body || head.length > 160 || head.includes("\n")) {
    return { heading: null, body: t };
  }
  return { heading: head, body };
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
  "Purchase and iPhone",
  "Exchange $30 to USDC Sol",
  "Exchange $30 to USDC ETh",
];

function useAutosizeTextArea(
  textAreaRef: RefObject<HTMLTextAreaElement | null>,
  value: string,
  layoutBump = 0,
) {
  useEffect(() => {
    const el = textAreaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(160, Math.max(40, el.scrollHeight))}px`;
  }, [value, textAreaRef, layoutBump]);
}

function AiThinkingIndicator() {
  return (
    <div className="chat-msg-thinking" role="status" aria-label="AI is thinking">
      <span className="chat-msg-thinking-dot" />
      <span className="chat-msg-thinking-dot" />
      <span className="chat-msg-thinking-dot" />
    </div>
  );
}

function ChatHomePanel({ onPromptClick, onBack }: { onPromptClick: (p: string) => void; onBack: () => void }) {
  return (
    <div className="chat-home-panel-inner">
      <button type="button" className="chat-ai-back-btn" onClick={onBack} aria-label="Back">
        <img src={backIcon} alt="" width={14} height={11} className="chat-ai-back-icon" />
      </button>
      <header className="chat-ai-header-block">
        <div className="chat-ai-title-lines">
          <p>Hi Dear</p>
          <p>Start your transactions..</p>
        </div>
        <p className="chat-ai-subtitle">Prompt our Ai to make any transaction .</p>
      </header>
      <div className="chat-suggestions">
        {SUGGESTIONS.map((s, i) => (
          <button
            key={i}
            type="button"
            className="chat-suggestion-row"
            onClick={() => onPromptClick(s)}
          >
            <span className="chat-suggestion-bullet" aria-hidden />
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
  attachMenuOpen: boolean;
  onAttachToggle: () => void;
  onAttachClose: () => void;
  onTypingSend: () => void;
  onIdleSendClick: () => void;
  onRecordingCancel: () => void;
  /** Stop recording and start send (shows process icon while sending) */
  onRecordingConfirmSend: () => void;
  pendingAttachmentPreviews: { id: string; url: string }[];
  onRemovePendingAttachment: (id: string) => void;
  onImageFilesSelected: (files: FileList | null) => void;
}

const ChatComposer = forwardRef<HTMLDivElement, ChatComposerProps>(function ChatComposer(
  {
  value,
  onChange,
  voiceFlow,
  recordingTick,
  voicePreviewBars,
  textAreaRef,
  onMic,
  attachMenuOpen,
  onAttachToggle,
  onAttachClose,
  onTypingSend,
  onIdleSendClick,
  onRecordingCancel,
  onRecordingConfirmSend,
  pendingAttachmentPreviews,
  onRemovePendingAttachment,
  onImageFilesSelected,
},
  ref,
) {
  const filesInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const photosInputRef = useRef<HTMLInputElement>(null);

  useAutosizeTextArea(textAreaRef, value, pendingAttachmentPreviews.length);

  useEffect(() => {
    if (!attachMenuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onAttachClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [attachMenuOpen, onAttachClose]);

  const isVoice = voiceFlow !== "none";

  const placeholder = "Send a message..";

  const dockClass = "chat-composer-dock-gradient";

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
        <div className="chat-composer-voice-actions chat-composer-voice-actions--vn-pills">
          <button
            type="button"
            className="chat-composer-voice-btn chat-composer-voice-btn--pill-icon"
            onClick={onRecordingCancel}
            aria-label="Cancel recording"
          >
            <img src={cancelVnIcon} alt="" width={COMPOSER_ACTION_IMG.width} height={COMPOSER_ACTION_IMG.height} />
          </button>
          <button
            type="button"
            className="chat-composer-voice-btn chat-composer-voice-btn--pill-icon"
            onClick={onRecordingConfirmSend}
            aria-label="Stop recording and send"
          >
            <img src={confirmVnIcon} alt="" width={COMPOSER_ACTION_IMG.width} height={COMPOSER_ACTION_IMG.height} />
          </button>
        </div>
      </div>
    );
  } else if (voiceFlow === "sending") {
    row = (
      <div className="chat-input-row chat-input-row--voice">
        <div className="chat-vn-strip">
          {Array.from({ length: voicePreviewBars }, (_, i) => (
            <img key={i} src={vnIcon} alt="" className="chat-vn-icon" />
          ))}
        </div>
        <div className="chat-composer-voice-actions chat-composer-voice-actions--vn-pills">
          <button
            type="button"
            className="chat-composer-voice-btn chat-composer-voice-btn--pill-icon"
            disabled
            aria-label="Cancel"
          >
            <img src={cancelVnIcon} alt="" width={COMPOSER_ACTION_IMG.width} height={COMPOSER_ACTION_IMG.height} />
          </button>
          <button
            type="button"
            className="chat-composer-voice-btn chat-composer-voice-btn--pill-icon"
            disabled
            aria-label="Processing voice note"
          >
            <img src={processVnIcon} alt="" width={COMPOSER_ACTION_IMG.width} height={COMPOSER_ACTION_IMG.height} />
          </button>
        </div>
      </div>
    );
  } else {
    row = (
      <div className="chat-composer-stack">
        {pendingAttachmentPreviews.length > 0 ? (
          <div className="chat-composer-pending-images">
            {pendingAttachmentPreviews.map((p) => (
              <div key={p.id} className="chat-composer-pending-thumb-wrap">
                <img className="chat-composer-pending-thumb" src={p.url} alt="" />
                <button
                  type="button"
                  className="chat-composer-pending-remove"
                  onClick={() => onRemovePendingAttachment(p.id)}
                  aria-label="Remove image"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        ) : null}
        <textarea
          ref={textAreaRef}
          className="chat-composer-textarea-idle"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={1}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey && (value.trim() || pendingAttachmentPreviews.length > 0)) {
              e.preventDefault();
              onTypingSend();
            }
          }}
        />
        <div className="chat-composer-icons-row">
          <div className="chat-composer-attach-anchor">
            {attachMenuOpen ? (
              <div className="chat-attach-menu" role="menu" aria-label="Attach file">
                <input
                  ref={filesInputRef}
                  type="file"
                  className="chat-hidden-file-input"
                  tabIndex={-1}
                  multiple
                  accept="image/*"
                  onChange={(e) => {
                    onImageFilesSelected(e.target.files);
                    e.target.value = "";
                    onAttachClose();
                  }}
                />
                <input
                  ref={cameraInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="chat-hidden-file-input"
                  tabIndex={-1}
                  onChange={(e) => {
                    onImageFilesSelected(e.target.files);
                    e.target.value = "";
                    onAttachClose();
                  }}
                />
                <input
                  ref={photosInputRef}
                  type="file"
                  accept="image/*"
                  className="chat-hidden-file-input"
                  tabIndex={-1}
                  multiple
                  onChange={(e) => {
                    onImageFilesSelected(e.target.files);
                    e.target.value = "";
                    onAttachClose();
                  }}
                />
                <button
                  type="button"
                  role="menuitem"
                  className="chat-attach-menu-row chat-attach-menu-row--first"
                  onClick={() => filesInputRef.current?.click()}
                >
                  <span className="chat-attach-menu-label">Files</span>
                  <img src={fileMenuIcon} alt="" className="chat-attach-menu-icon chat-attach-menu-icon--file" />
                </button>
                <button
                  type="button"
                  role="menuitem"
                  className="chat-attach-menu-row"
                  onClick={() => cameraInputRef.current?.click()}
                >
                  <span className="chat-attach-menu-label">Camera</span>
                  <img src={cameraMenuIcon} alt="" className="chat-attach-menu-icon chat-attach-menu-icon--camera" />
                </button>
                <button
                  type="button"
                  role="menuitem"
                  className="chat-attach-menu-row"
                  onClick={() => photosInputRef.current?.click()}
                >
                  <span className="chat-attach-menu-label">Photos</span>
                  <img src={photoMenuIcon} alt="" className="chat-attach-menu-icon chat-attach-menu-icon--photo" />
                </button>
              </div>
            ) : null}
            <button
              type="button"
              className="chat-composer-asset-btn"
              onClick={(e) => {
                e.stopPropagation();
                onAttachToggle();
              }}
              aria-label="Attach"
              aria-expanded={attachMenuOpen}
            >
              <img
                src={attachMenuOpen ? docActiveIcon : docIcon}
                alt=""
                width={COMPOSER_ACTION_IMG.width}
                height={COMPOSER_ACTION_IMG.height}
              />
            </button>
          </div>
          <div className="chat-composer-icons-right">
            <button type="button" className="chat-composer-asset-btn" onClick={onMic} aria-label="Voice note">
              <img src={voiceIcon} alt="" width={COMPOSER_ACTION_IMG.width} height={COMPOSER_ACTION_IMG.height} />
            </button>
            <button type="button" className="chat-composer-asset-btn" onClick={onIdleSendClick} aria-label="Send">
              <img src={sendBtnIcon} alt="" width={COMPOSER_ACTION_IMG.width} height={COMPOSER_ACTION_IMG.height} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  const showAttachChrome = attachMenuOpen && !isVoice;

  return (
    <div ref={ref} className="chat-composer-section">
      {showAttachChrome ? (
        <div className="chat-attach-backdrop" role="presentation" onClick={onAttachClose} />
      ) : null}
      <div className={dockClass}>
        <div className="chat-composer-dock-inner">{row}</div>
      </div>
    </div>
  );
});

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
      <header className="chat-thread-header">
        <button type="button" className="chat-ai-back-btn chat-thread-back-btn" onClick={onBack} aria-label="Back">
          <img src={backIcon} alt="" width={14} height={11} className="chat-ai-back-icon" />
        </button>
      </header>
      <div className="ai-chat-messages">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`chat-msg-turn ${m.role === "user" ? "chat-msg-turn--user" : "chat-msg-turn--ai"}`}
          >
            {m.role === "user" ? (
              m.imageUrls?.length ? (
                <div className="chat-msg-user-row">
                  <div className="chat-msg-user-media-stack">
                    <div className="chat-msg-user-media-row">
                      {m.imageUrls.map((src, idx) => (
                        <div
                          key={`${m.id}-img-${idx}`}
                          className={
                            idx === 1
                              ? "chat-msg-user-media-item chat-msg-user-media-item--tilt"
                              : "chat-msg-user-media-item"
                          }
                        >
                          <img src={src} alt="" />
                        </div>
                      ))}
                    </div>
                    {m.text.trim() ? (
                      <div className="chat-msg-user-bubble chat-msg-user-bubble--under-media">
                        <p className="chat-msg-user-text">{m.text}</p>
                      </div>
                    ) : null}
                  </div>
                </div>
              ) : (
                <div className="chat-msg-user-row">
                  <div className="chat-msg-user-bubble">
                    <p className="chat-msg-user-text">{m.isVoice ? "Voice message" : m.text}</p>
                  </div>
                </div>
              )
            ) : m.isTransaction ? (
              <div className="flex flex-col gap-3">
                {m.text && (
                  <div className="chat-msg-ai-block mt-1">
                    <div className="chat-msg-ai-body chat-msg-ai-body--solo">
                      <TextWithLinks text={m.text} />
                    </div>
                  </div>
                )}
                <div className="chat-msg-ai-row chat-msg-ai-row--transaction">
                  <button
                    type="button"
                    onClick={() => onTransactionClick(m)}
                    className="chat-msg-tx-wrap"
                  >
                    <div className="chat-msg-tx-label">{m.transactionDetails?.label}</div>
                    <div className="chat-msg-tx-card">
                      <div className="chat-msg-tx-strong">{m.transactionDetails?.title || "Transaction generated!"}</div>
                      <div>{m.transactionDetails?.sent}</div>
                      <div>{m.transactionDetails?.to}</div>
                      <div className="chat-msg-tx-result">{m.transactionDetails?.result}</div>
                    </div>
                  </button>
                </div>
              </div>
            ) : (
              (() => {
                const { heading, body } = splitAiMessage(m.text);
                return (
                  <div className="chat-msg-ai-block">
                    {heading ? (
                      <>
                        <p className="chat-msg-ai-heading">{heading}</p>
                        <div className="chat-msg-ai-body">
                          <TextWithLinks text={body} />
                        </div>
                      </>
                    ) : (
                      <div className="chat-msg-ai-body chat-msg-ai-body--solo">
                        <TextWithLinks text={body} />
                      </div>
                    )}
                  </div>
                );
              })()
            )}
          </div>
        ))}

        {showTyping ? (
          <div className="chat-msg-turn chat-msg-turn--ai">
            <div className="chat-msg-thinking-wrap">
              <span className="chat-msg-thinking-accent" aria-hidden />
              <AiThinkingIndicator />
            </div>
          </div>
        ) : null}
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
  const [screen, setScreen] = useState<Screen>("home");

  const [onrampOpen, setOnrampOpen] = useState(false);
  const [onrampDraft, setOnrampDraft] = useState<{ amount: string, token: string, currency: string } | null>(null);

  const [offrampOpen, setOfframpOpen] = useState(false);
  const [offrampDraft, setOfframpDraft] = useState<{ amount: string, token: string } | null>(null);

  // Persistent messages from the backend
  const [messages, setMessages] = useState<Message[]>([]);

  const [showTyping, setShowTyping] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [voiceFlow, setVoiceFlow] = useState<VoiceFlow>("none");
  const [recordingTick, setRecordingTick] = useState(0);
  const [voicePreviewBars, setVoicePreviewBars] = useState(8);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
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
    if (!composer) {
      root.style.setProperty("--ai-composer-spacer", "0px");
      return;
    }

    const isMobile = window.matchMedia("(max-width: 768px)").matches;

    const vv = window.visualViewport;
    const keyboard =
      vv != null ? Math.max(0, window.innerHeight - vv.offsetTop - vv.height) : 0;

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
      });
    };

    const ro =
      typeof ResizeObserver !== "undefined" && composer
        ? new ResizeObserver(scheduleLayout)
        : null;
    if (composer && ro) {
      ro.observe(composer);
    }

    const mobileMq = window.matchMedia("(max-width: 768px)");
    const onMobileMq = () => scheduleLayout();
    if (typeof mobileMq.addEventListener === "function") {
      mobileMq.addEventListener("change", onMobileMq);
    } else {
      mobileMq.addListener(onMobileMq);
    }

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
      if (typeof mobileMq.removeEventListener === "function") {
        mobileMq.removeEventListener("change", onMobileMq);
      } else {
        mobileMq.removeListener(onMobileMq);
      }
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
      (inputValue.length > 0 || voiceFlow !== "none" || pendingAttachments.length > 0));

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
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue("");
    setPendingAttachments([]);
    resetVoice();
    setScreen("chat-responding");
    setShowTyping(true);

    const intentText = t || "User shared image(s).";

    try {
      const res = await postAiIntent(intentText);
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
            token: String(res.data.params.token || "SOL"),
            recipient: String(res.data.params.recipient || res.data.params.toAddress || "Unknown"),
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
            type: 'swap',
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
          aiMsg.transactionParams = {
            type: 'onramp',
            amount: String(res.data.params.amount || ""),
            token: String(res.data.params.token || "solana:usdc"),
            currency: String(res.data.params.currency || "NGN"),
          };
          aiMsg.transactionDetails = {
            label: "Buy Crypto Request",
            title: "Onramp Transaction",
            sent: res.data.params.currency && res.data.params.currency !== "NGN" 
              ? `Crypto: ${res.data.params.amount} ${res.data.params.currency}`
              : `Spend: ${res.data.params.amount ? '₦' + res.data.params.amount : '₦0'}`,
            to: `Receive: ${res.data.params.token}`,
            result: "Tap to review or change the amount",
          };
          // Don't set pending transaction for onramp since it has its own modal
        } else if (res.data.intent === "OFFRAMP_CRYPTO") {
          aiMsg.isTransaction = true;
          aiMsg.transactionParams = {
            type: 'offramp',
            amount: String(res.data.params.amount || ""),
            token: String(res.data.params.token || "solana:usdc"),
          };
          aiMsg.transactionDetails = {
            label: "Sell Crypto Request",
            title: "Offramp Transaction",
            sent: `Selling: ${res.data.params.amount} ${res.data.params.token.toUpperCase()}`,
            to: `Receive: Naira (Bank)`,
            result: "Tap to enter bank details and withdraw",
          };
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
  }, [inputValue, pendingAttachments, enterThreadIfNeeded, resetVoice]);

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

          const explorerUrl = `https://solscan.io/tx/${res.data.hash}`;
          setMessages(prev => [...prev, {
            id: `sw-suc-${Date.now()}`,
            role: "ai",
            text: `Swap complete! Your assets have been exchanged on Jupiter. [View on Solscan](${explorerUrl})`,
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

          const explorerUrl = `https://solscan.io/tx/${res.data.hash}`;
          setMessages(prev => [...prev, {
            id: `tx-suc-${Date.now()}`,
            role: "ai",
            text: `Payment sent! Your transaction has been recorded on the blockchain. [View on Solscan](${explorerUrl})`,
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
      ref={composerSectionRef}
      value={inputValue}
      onChange={setInputValue}
      voiceFlow={voiceFlow}
      recordingTick={recordingTick}
      voicePreviewBars={voicePreviewBars}
      textAreaRef={textAreaRef}
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
        if (inputValue.trim() || pendingAttachments.length > 0) handleSendText();
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
        <div className="ai-chat-screen-layout">
          <div className="chat-main-panel">
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
              <div className="chat-blank-main" aria-hidden />
            )}
          </div>
          {(!onrampOpen && !offrampOpen && !confirmOpen) && composerEl}
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
          onTransactionClick={(msg) => {
            if (msg.transactionParams) {
              if (msg.transactionParams.type === 'onramp') {
                setOnrampDraft({
                  amount: msg.transactionParams.amount,
                  token: msg.transactionParams.token,
                  currency: msg.transactionParams.currency
                });
                setOnrampOpen(true);
              } else if (msg.transactionParams.type === 'offramp') {
                setOfframpDraft({
                  amount: msg.transactionParams.amount,
                  token: msg.transactionParams.token
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
    <>
      <style>{`
        @keyframes vwave{from{transform:scaleY(0.3)}to{transform:scaleY(1)}}
        .ai-chat-root *{box-sizing:border-box}
        .ai-chat-messages::-webkit-scrollbar{width:4px}
        .ai-chat-messages::-webkit-scrollbar-thumb{background:#2A2A3A;border-radius:2px}
      `}</style>
      <div className="jumpa-theme-wrapper">
        <div className="phone-frame" ref={phoneFrameRef}>
          <div
            className="app-content app-content--ai-chat"
            style={{
              display: "flex",
              flexDirection: "column",
              minHeight: 0,
              height: "100%",
              overflow: "hidden",
            }}
          >
            <div className="ai-chat-root" ref={aiChatRootRef}>
              <div className="ai-chat-layout-fill">
                {renderMain()}
              </div>
              <TransactionConfirmDrawer
                open={confirmOpen}
                onOpenChange={setConfirmOpen}
                details={pendingTransaction}
                onConfirm={handleConfirmTransaction}
                processing={confirmProcessing}
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
                onOpenChange={setOfframpOpen}
                defaultAmount={offrampDraft?.amount}
                defaultToken={offrampDraft?.token}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
