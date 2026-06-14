"use client";
import {
  useEffect,
  useState,
  useCallback,
  forwardRef,
  type RefObject,
  type ReactNode,
} from "react";

// ─── Icon paths ──────────────────────────────────────────────────────────────
export const backIcon = "/assets/icons/actions/back.svg";
export const docIcon = "/assets/icons/actions/doc.svg";
export const docActiveIcon = "/assets/icons/actions/doc-active.svg";
export const fileMenuIcon = "/assets/icons/actions/file.svg";
export const cameraMenuIcon = "/assets/icons/actions/camera.svg";
export const photoMenuIcon = "/assets/icons/actions/photo.svg";
export const voiceIcon = "/assets/icons/actions/voice%20copy.svg";
export const sendBtnIcon = "/assets/icons/actions/sendbtn.svg";
export const vnIcon = "/assets/icons/actions/vn.svg";
export const cancelVnIcon = "/assets/icons/actions/cancel-vn.svg";
export const confirmVnIcon = "/assets/icons/actions/confirm-vn.svg";
export const processVnIcon = "/assets/icons/actions/process.svg";

export const COMPOSER_ACTION_IMG = { width: 37, height: 29 } as const;
export const MAX_PENDING_CHAT_IMAGES = 8;

// ─── Types ───────────────────────────────────────────────────────────────────
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

export function barsFromRecordingTick(tick: number) {
  return Math.min(14, Math.max(2, 2 + Math.floor(tick / 4)));
}

export function splitAiMessage(text: string): { heading: string | null; body: string } {
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

export function useAutosizeTextArea(
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

export function TextWithLinks({ text }: { text: string }) {
  const parts = text.split(/([\s\S]*?\]\(https?:\/\/\S+?\))/g);
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

export function AiThinkingIndicator() {
  return (
    <div
      className="inline-flex flex-row items-center justify-center gap-[3px] w-[54px] h-4 bg-[#5a5a5a] rounded-[2px]"
      role="status"
      aria-label="AI is thinking"
    >
      <span className="w-4 h-4 rounded-full bg-[#5a5a5a] shrink-0" />
      <span className="w-4 h-4 rounded-full bg-[#5a5a5a] shrink-0" />
      <span className="w-4 h-4 rounded-full bg-[#5a5a5a] shrink-0" />
    </div>
  );
}

export function VoiceScreen({ processing }: { processing: boolean }) {
  return (
    <div className="flex-1 min-h-0 flex flex-col bg-black w-full max-w-[390px] mx-auto box-border">
      <div style={{ flex: 1 }} />
      <div className="flex items-center gap-[10px] px-4 pt-[14px] pb-5 border-t border-[#2A2A3A] bg-[#0A0A0F] shrink-0">
        <div className="flex-1 flex items-center gap-[2px] h-9">
          {Array.from({ length: 45 }).map((_, i) => (
            <div
              key={i}
              className="w-[3px] rounded-[2px]"
              style={{
                background: processing ? "rgb(124, 92, 252)" : "#8888AA",
                height: `${16 + Math.abs(Math.sin(i * 0.7)) * 20}px`,
                opacity: 0.6 + Math.abs(Math.sin(i * 0.5)) * 0.4,
                animation: processing
                  ? `vwave 1s ${i * 0.02}s infinite alternate ease-in-out`
                  : "none",
              }}
            />
          ))}
        </div>
        <button
          type="button"
          className="w-10 h-10 rounded-full border-none bg-[#1A1A24] flex items-center justify-center cursor-pointer"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8888AA" strokeWidth="2.5">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
        <button
          type="button"
          className="w-10 h-10 rounded-full border-none bg-[#7c5cfc] flex items-center justify-center cursor-pointer"
        >
          {processing ? (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          ) : (
            <div className="w-3 h-3 rounded-full bg-white" />
          )}
        </button>
      </div>
    </div>
  );
}

export interface ChatComposerProps {
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
  onRecordingConfirmSend: () => void;
  pendingAttachmentPreviews: { id: string; url: string }[];
  onRemovePendingAttachment: (id: string) => void;
  onImageFilesSelected: (files: FileList | null) => void;
  filesInputRef: RefObject<HTMLInputElement | null>;
  cameraInputRef: RefObject<HTMLInputElement | null>;
  photosInputRef: RefObject<HTMLInputElement | null>;
}

export const ChatComposer = forwardRef<HTMLDivElement, ChatComposerProps>(
  function ChatComposer(
    {
      value, onChange, voiceFlow, recordingTick, voicePreviewBars,
      textAreaRef, onMic, attachMenuOpen, onAttachToggle, onAttachClose,
      onTypingSend, onIdleSendClick, onRecordingCancel, onRecordingConfirmSend,
      pendingAttachmentPreviews, onRemovePendingAttachment, onImageFilesSelected,
      filesInputRef, cameraInputRef, photosInputRef,
    },
    ref,
  ) {
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
    let row: ReactNode;

    if (voiceFlow === "recording") {
      const n = barsFromRecordingTick(recordingTick);
      row = (
        <div className="w-full max-w-[341px] mx-auto min-h-[38.982px] flex items-center justify-between gap-[6.49px] px-3 py-[6px] box-border rounded-[20px]">
          <div className="flex-1 min-w-0 flex flex-row items-center justify-end gap-1 overflow-hidden py-1 pl-2">
            {Array.from({ length: n }, (_, i) => (
              <img key={`${n}-${i}`} src={vnIcon} alt="" className="chat-vn-icon w-6 h-6 shrink-0 object-contain opacity-95" />
            ))}
          </div>
          <div className="flex items-center shrink-0 gap-[3px]">
            <button type="button" className="bg-transparent border-none p-0" onClick={onRecordingCancel} aria-label="Cancel recording">
              <img src={cancelVnIcon} alt="" width={COMPOSER_ACTION_IMG.width} height={COMPOSER_ACTION_IMG.height} />
            </button>
            <button type="button" className="bg-transparent border-none p-0" onClick={onRecordingConfirmSend} aria-label="Stop recording and send">
              <img src={confirmVnIcon} alt="" width={COMPOSER_ACTION_IMG.width} height={COMPOSER_ACTION_IMG.height} />
            </button>
          </div>
        </div>
      );
    } else if (voiceFlow === "sending") {
      row = (
        <div className="w-full max-w-[341px] mx-auto min-h-[38.982px] flex items-center justify-between gap-[6.49px] px-3 py-[6px] box-border rounded-[20px]">
          <div className="flex-1 min-w-0 flex flex-row items-center justify-end gap-1 overflow-hidden py-1 pl-2">
            {Array.from({ length: voicePreviewBars }, (_, i) => (
              <img key={i} src={vnIcon} alt="" className="chat-vn-icon w-6 h-6 shrink-0 object-contain opacity-95" />
            ))}
          </div>
          <div className="flex items-center shrink-0 gap-[3px]">
            <button type="button" className="bg-transparent border-none p-0" disabled aria-label="Cancel">
              <img src={cancelVnIcon} alt="" width={COMPOSER_ACTION_IMG.width} height={COMPOSER_ACTION_IMG.height} />
            </button>
            <button type="button" className="bg-transparent border-none p-0" disabled aria-label="Processing voice note">
              <img src={processVnIcon} alt="" width={COMPOSER_ACTION_IMG.width} height={COMPOSER_ACTION_IMG.height} />
            </button>
          </div>
        </div>
      );
    } else {
      row = (
        <div className="flex flex-col gap-10 w-full p-2 box-border rounded-[31px_31px_0_0] bg-black">
          {pendingAttachmentPreviews.length > 0 && (
            <div className="flex flex-row flex-wrap gap-2 w-full px-3 mb-1 ">
              {pendingAttachmentPreviews.map((p) => (
                <div key={p.id} className="relative w-[60px] h-[60px] shrink-0 rounded-[4px] overflow-hidden">
                  <img className="w-full h-full object-cover block" src={p.url} alt="" />
                  <button
                    type="button"
                    className="absolute top-[2px] right-[2px] w-5 h-5 p-0 border-none rounded-full bg-black/65 text-white text-sm leading-none cursor-pointer flex items-center justify-center"
                    onClick={() => onRemovePendingAttachment(p.id)}
                    aria-label="Remove image"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
          <div className="flex flex-row items-end gap-2 w-full px-2">
            {/* Input field */}
            <div className="flex-1 min-w-0 bg-transparent flex items-center min-h-[40px]">
              <textarea
                ref={textAreaRef}
                className="w-full min-h-[20px] max-h-[160px] resize-none border-none outline-none bg-transparent font-[Geist,sans-serif] font-normal text-[15px] leading-[1.4] text-[#f4f4f4] py-2 px-1 box-border overflow-y-auto placeholder:text-[#5a5a5a]"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder="Send a message.."
                rows={1}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey && (value.trim() || pendingAttachmentPreviews.length > 0)) {
                    e.preventDefault();
                    onTypingSend();
                  }
                }}
              />
            </div>
            {/* Action buttons on the right */}
            <div className="flex flex-row items-center gap-2 shrink-0 pb-[3px]">
              {/* Attachment Button */}
              <div className="relative inline-flex items-center">
                {attachMenuOpen && (
                  <div className="absolute right-0 bottom-[calc(100%+12px)] w-[176px] h-[120px] rounded-[20px] bg-[#101010] shadow-[0_40px_40px_0_rgba(0,0,0,0.5)] z-102 flex flex-col overflow-hidden" role="menu" aria-label="Attach file">
                    <input ref={filesInputRef} type="file" className="chat-hidden-file-input" tabIndex={-1} multiple accept="image/*"
                      onChange={(e) => { onImageFilesSelected(e.target.files); e.target.value = ""; onAttachClose(); }} />
                    <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" className="chat-hidden-file-input" tabIndex={-1}
                      onChange={(e) => { onImageFilesSelected(e.target.files); e.target.value = ""; onAttachClose(); }} />
                    <input ref={photosInputRef} type="file" accept="image/*" className="chat-hidden-file-input" tabIndex={-1} multiple
                      onChange={(e) => { onImageFilesSelected(e.target.files); e.target.value = ""; onAttachClose(); }} />

                    <button type="button" role="menuitem"
                      className="chat-attach-menu-row--first flex-[0_0_40px] h-10 box-border w-full flex flex-row items-center justify-between gap-[10px] px-[15px] border-none bg-transparent cursor-pointer text-inherit font-inherit text-left transition-[background] duration-120 hover:bg-white/0.04"
                      onClick={() => filesInputRef.current?.click()}>
                      <span className="font-[Geist,sans-serif] font-normal text-xs leading-[145%] text-[#909090]">Files</span>
                      <img src={fileMenuIcon} alt="" className="block shrink-0 object-contain w-[13.33px] h-[16.66px]" />
                    </button>
                    <button type="button" role="menuitem"
                      className="chat-attach-menu-row flex-[0_0_40px] h-10 box-border w-full flex flex-row items-center justify-between gap-[10px] px-[15px] border-none bg-transparent cursor-pointer text-inherit font-inherit text-left transition-[background] duration-120 hover:bg-white/0.04"
                      onClick={() => cameraInputRef.current?.click()}>
                      <span className="font-[Geist,sans-serif] font-normal text-xs leading-[145%] text-[#909090]">Camera</span>
                      <img src={cameraMenuIcon} alt="" className="block shrink-0 object-contain w-[16.67px] h-[15px]" />
                    </button>
                    <button type="button" role="menuitem"
                      className="chat-attach-menu-row flex-[0_0_40px] h-10 box-border w-full flex flex-row items-center justify-between gap-[10px] px-[15px] border-none bg-transparent cursor-pointer text-inherit font-inherit text-left transition-[background] duration-120 hover:bg-white/0.04"
                      onClick={() => photosInputRef.current?.click()}>
                      <span className="font-[Geist,sans-serif] font-normal text-xs leading-[145%] text-[#909090]">Photos</span>
                      <img src={photoMenuIcon} alt="" className="block shrink-0 object-contain w-[15px] h-[15.84px]" />
                    </button>
                  </div>
                )}
                <button
                  type="button"
                  className="w-10 h-10 p-0 border-none rounded-full bg-[#6a59ce] cursor-pointer flex items-center justify-center transition-all duration-150 hover:bg-[#7d6df3] hover:shadow-[0_0_10px_rgba(106,89,206,0.3)] active:scale-95 shrink-0"
                  onClick={(e) => { e.stopPropagation(); onAttachToggle(); }}
                  aria-label="Attach"
                  aria-expanded={attachMenuOpen}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="rotate-[45deg]">
                    <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
                  </svg>
                </button>
              </div>

              {/* Voice Button */}
              <button
                type="button"
                className="w-10 h-10 p-0 border-none rounded-full bg-[#6a59ce] cursor-pointer flex items-center justify-center transition-all duration-150 hover:bg-[#7d6df3] hover:shadow-[0_0_10px_rgba(106,89,206,0.3)] active:scale-95 shrink-0"
                onClick={onMic}
                aria-label="Voice note"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z" />
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                  <line x1="12" y1="19" x2="12" y2="22" />
                </svg>
              </button>

              {/* Send Button */}
              <button
                type="button"
                className="w-10 h-10 p-0 border-none rounded-full bg-[#6a59ce] cursor-pointer flex items-center justify-center transition-all duration-150 hover:bg-[#7d6df3] hover:shadow-[0_0_10px_rgba(106,89,206,0.3)] active:scale-95 shrink-0"
                onClick={onIdleSendClick}
                aria-label="Send"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="mr-[1px] mt-[1px]">
                  <line x1="22" y1="2" x2="11" y2="13" />
                  <polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div ref={ref} className="chat-composer-section fixed bottom-0 z-500 left-1/2 -translate-x-1/2 w-full max-w-[390px] mx-auto box-border flex flex-col justify-end items-stretch bg-black">
        {attachMenuOpen && !isVoice && (
          <div className="fixed inset-0 z-101 bg-black/45 cursor-default" role="presentation" onClick={onAttachClose} />
        )}
        <div className="chat-composer-dock-gradient w-full max-w-[390px] mx-auto box-border rounded-[32px_32px_0_0] overflow-visible">
          <div className="box-border min-h-[72px] rounded-[31px_31px_0_0] bg-black p-[5px] flex flex-col gap-[10px] justify-end overflow-visible">
            {row}
          </div>
        </div>
      </div>
    );
  }
);

export function UserBubble({ text, isVoice }: { text: string; isVoice?: boolean }) {
  return (
    <div className="chat-msg-user-bubble box-border max-w-[324px] w-fit p-[10px] rounded-[18px] bg-[#2d2d2d] relative">
      <p className="m-0 font-[Geist,sans-serif] font-normal text-xs leading-[145%] text-[#d5d5d5] overflow-anywhere wrap-break-word">
        {isVoice ? "Voice message" : text}
      </p>
    </div>
  );
}

export function UserMediaBubble({ imageUrls, text }: { imageUrls: string[]; text: string }) {
  return (
    <div className="flex flex-col items-end gap-[10px] max-w-[324px] w-fit">
      <div className="flex flex-row flex-wrap gap-3 items-end justify-end">
        {imageUrls.map((src, idx) => (
          <div
            key={idx}
            className={`rounded-[4px] overflow-hidden shrink-0 ${idx === 1 ? "rotate-6 border-2 border-white rounded-[3px] overflow-visible box-border" : ""}`}
          >
            <img src={src} alt="" className="block max-h-[140px] w-auto max-w-[min(160px,42vw)] object-cover" />
          </div>
        ))}
      </div>
      {text.trim() && (
        <div className="chat-msg-user-bubble box-border max-w-full w-fit p-[10px] rounded-[22px] bg-[#2d2d2d] relative">
          <p className="m-0 font-[Geist,sans-serif] font-normal text-xs leading-[145%] text-[#d5d5d5] overflow-anywhere wrap-break-word">
            {text}
          </p>
        </div>
      )}
    </div>
  );
}

/** Renders inline markdown: **bold**, *italic*, `code`, and [links](url) */
function renderInlineMarkdown(text: string): React.ReactNode[] {
  // Split on bold (**), italic (*), inline code (`), and markdown links
  const parts = text.split(/(\*\*[\s\S]+?\*\*|\*[^*]+?\*|`[^`]+?`|\[[\s\S]*?\]\(https?:\/\/\S+?\))/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i} className="font-bold text-[#f4f4f4]">{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith('*') && part.endsWith('*') && !part.startsWith('**')) {
      return <em key={i} className="italic">{part.slice(1, -1)}</em>;
    }
    if (part.startsWith('`') && part.endsWith('`')) {
      return <code key={i} className="bg-white/10 rounded px-1 font-mono text-xs text-[#e2e8f0]">{part.slice(1, -1)}</code>;
    }
    const linkMatch = part.match(/\[([\s\S]*?)\]\((https?:\/\/\S+?)\)/);
    if (linkMatch) {
      return <a key={i} href={linkMatch[2]} target="_blank" rel="noopener noreferrer" className="text-[#c4b5fd] font-semibold underline break-all">{linkMatch[1]}</a>;
    }
    return <span key={i}>{part}</span>;
  });
}

/** Renders a block of AI text, splitting on blank lines into paragraphs */
function renderMarkdownBlock(text: string): React.ReactNode {
  const paragraphs = text.split(/\n\n+/);
  if (paragraphs.length === 1) {
    // Single paragraph — render lines
    const lines = text.split('\n');
    return lines.map((line, i) => (
      <span key={i}>
        {renderInlineMarkdown(line)}
        {i < lines.length - 1 && <br />}
      </span>
    ));
  }
  return paragraphs.map((para, i) => (
    <p key={i} className="m-0 mb-1 last:mb-0">
      {renderInlineMarkdown(para)}
    </p>
  ));
}

export function AiTextBlock({ text }: { text: string }) {
  const trimmed = text.trim();
  return (
    <div className="max-w-[324px] w-full ml-0 mr-auto flex flex-col gap-[6px] self-start">
      <div className="m-0 font-[Geist,sans-serif] font-normal text-sm leading-[145%] text-[#d5d5d5] overflow-anywhere wrap-break-word">
        {renderMarkdownBlock(trimmed)}
      </div>
    </div>
  );
}

export function TransactionBlock({
  msg,
  onTransactionClick,
  disabled = false,
}: {
  msg: Message;
  onTransactionClick: (msg: Message) => void;
  disabled?: boolean;
}) {
  const isSwap = msg.transactionParams?.type === "swap";
  const labelText = msg.transactionDetails?.label || (isSwap ? "Swap Intent" : "Transfer Intent");
  const titleText = msg.transactionDetails?.title || (isSwap ? "Drafted Swap" : "Pending Transfer");

  // Clean values from params
  const isCompleted = msg.transactionDetails?.result?.toLowerCase().includes("complete") || msg.transactionDetails?.result?.toLowerCase().includes("sent");

  // If disabled and NOT completed, we remove the card block completely from the UI (only rendering the preceding helper text if any).
  if (disabled && !isCompleted) {
    if (!msg.text) return null;
    return (
      <div className="flex flex-col gap-3 w-full max-w-[324px]">
        <div className="w-full ml-0 mr-auto flex flex-col gap-[6px] self-start mt-1">
          <div className="m-0 font-[Geist,sans-serif] font-normal text-sm leading-[145%] text-[#d5d5d5] whitespace-pre-wrap overflow-anywhere wrap-break-word">
            <TextWithLinks text={msg.text} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 w-full max-w-[324px]">
      {msg.text && (
        <div className="w-full ml-0 mr-auto flex flex-col gap-[6px] self-start mt-1">
          <div className="m-0 font-[Geist,sans-serif] font-normal text-sm leading-[145%] text-[#d5d5d5] whitespace-pre-wrap overflow-anywhere wrap-break-word">
            <TextWithLinks text={msg.text} />
          </div>
        </div>
      )}
      <div className="flex justify-start w-full self-start">
        <button
          type="button"
          disabled={disabled || isCompleted}
          onClick={() => onTransactionClick(msg)}
          className={`group flex flex-col gap-2 w-full text-left bg-transparent border-none p-0 select-none outline-none ${
            isCompleted || disabled ? "cursor-default" : "cursor-pointer"
          }`}
        >
          {/* Card Body */}
          <div className={`bg-[#18181b]/85 backdrop-blur-md text-white p-4 rounded-2xl text-[13px] border border-white/10 w-full shadow-2xl transition-all duration-300 flex flex-col gap-3.5 relative overflow-hidden ${
            isCompleted || disabled
              ? "opacity-60 border-white/5"
              : "group-hover:border-[#7c5cfc]/40 group-hover:bg-[#202024]/90"
          }`}>
            {/* Glossy top highlight glow */}
            <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
            
            {/* Header: Title & Intent Badge */}
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2">
                {isSwap ? (
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                    isCompleted || disabled
                      ? "bg-white/5 border border-white/10 text-white/40"
                      : "bg-[#7c5cfc]/15 border border-[#7c5cfc]/20 text-[#9f7aea]"
                  }`}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17 1l4 4-4 4" />
                      <path d="M3 11h18" />
                      <path d="M7 23l-4-4 4-4" />
                      <path d="M21 13H3" />
                    </svg>
                  </div>
                ) : (
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                    isCompleted || disabled
                      ? "bg-white/5 border border-white/10 text-white/40"
                      : "bg-[#3ec6c6]/15 border border-[#3ec6c6]/20 text-[#3ec6c6]"
                  }`}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="22" y1="2" x2="11" y2="13" />
                      <polygon points="22 2 15 22 11 13 2 9 22 2" />
                    </svg>
                  </div>
                )}
                <span className={`font-bold text-sm tracking-tight ${isCompleted || disabled ? "text-[#909090]" : "text-[#f4f4f4]"}`}>{titleText}</span>
              </div>
              
              <div className={`px-2 py-0.5 rounded-md text-[10px] font-bold tracking-wide uppercase border ${
                isCompleted || disabled
                  ? "bg-white/5 text-[#909090] border-white/10"
                  : isSwap 
                    ? "bg-[#7c5cfc]/10 text-[#a78bfa] border-[#7c5cfc]/20" 
                    : "bg-[#3ec6c6]/10 text-[#3ec6c6] border-[#3ec6c6]/20"
              }`}>
                {labelText}
              </div>
            </div>

            {/* Transaction Data Rows */}
            <div className="flex flex-col gap-2.5 w-full bg-white/[0.02] border border-white/5 rounded-xl p-3">
              {/* Sent / From Asset Row */}
              <div className="flex justify-between items-center w-full">
                <span className="text-[#909090] text-xs">{isSwap ? "From Asset" : "Amount"}</span>
                <span className={`font-semibold tracking-wide text-sm ${isCompleted || disabled ? "text-[#909090]" : "text-white"}`}>{msg.transactionDetails?.sent.replace("Amount: ", "").replace("From: ", "")}</span>
              </div>

              {/* Arrow Divider for Swaps */}
              {isSwap && (
                <div className="flex justify-center w-full py-0.5 border-t border-white/5">
                  <div className="text-[#909090] py-1">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="12" y1="5" x2="12" y2="19" />
                      <polyline points="19 12 12 19 5 12" />
                    </svg>
                  </div>
                </div>
              )}

              {/* To / Recipient Row */}
              <div className="flex flex-col gap-1 w-full pt-1.5 border-t border-white/5">
                <span className="text-[#909090] text-xs">{isSwap ? "To Asset" : "To Recipient"}</span>
                <div className="break-all font-mono text-[11px] bg-black/40 border border-white/5 p-2 rounded-lg text-[#d4d4d8] leading-[1.4] select-text">
                  {msg.transactionDetails?.to.replace("Recipient: ", "").replace("To: ", "")}
                </div>
              </div>
            </div>

            {/* Status / Confirm Bottom Bar */}
            <div className="flex items-center gap-2 mt-0.5 pt-1">
              {!isCompleted ? (
                <>
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#7c5cfc] opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-[#7c5cfc]"></span>
                  </span>
                  <span className="text-[#a78bfa] font-bold text-xs tracking-tight group-hover:text-white transition-colors">
                    {msg.transactionDetails?.result || "Tap to confirm and send"}
                  </span>
                </>
              ) : (
                <>
                  <span className="w-2 h-2 rounded-full bg-[#22c55e]"></span>
                  <span className="text-[#22c55e] font-bold text-xs tracking-tight">
                    {msg.transactionDetails?.result}
                  </span>
                </>
              )}
            </div>
          </div>
        </button>
      </div>
    </div>
  );
}

export function ThinkingRow() {
  return (
    <div className="mb-4 flex flex-row items-end gap-2 ml-0 mr-auto self-start">
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes thinking-dots {
          0%, 100% { transform: translateY(0); opacity: 0.35; }
          50% { transform: translateY(-4px); opacity: 1; }
        }
        .thinking-dot {
          animation: thinking-dots 1.2s infinite ease-in-out;
        }
      `}} />

      {/* Avatar (Left) */}
      <div className="w-8 h-8 rounded-full bg-[#3ec6c6] flex items-center justify-center shrink-0 shadow-[0_4px_12px_rgba(62,198,198,0.2)]">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      </div>

      {/* Thought Bubble (Right) */}
      <div className="relative">
        <div className="bg-[#18181b]/85 backdrop-blur-md border border-[#7c5cfc]/20 px-4 py-3 rounded-2xl flex flex-row gap-1.5 items-center justify-center min-w-[70px] h-[38px] box-border shadow-lg">
          <span className="thinking-dot w-2 h-2 rounded-full bg-[#a78bfa]" style={{ animationDelay: "0s" }} />
          <span className="thinking-dot w-2 h-2 rounded-full bg-[#a78bfa]" style={{ animationDelay: "0.2s" }} />
          <span className="thinking-dot w-2 h-2 rounded-full bg-[#a78bfa]" style={{ animationDelay: "0.4s" }} />
        </div>
        
        {/* Thought bubble trail dots */}
        <div className="w-2 h-2 rounded-full bg-[#18181b]/85 border border-[#7c5cfc]/20 absolute -bottom-1 -left-1 box-border" />
        <div className="w-1.5 h-1.5 rounded-full bg-[#18181b]/85 border border-[#7c5cfc]/20 absolute -bottom-2 -left-2 box-border" />
      </div>
    </div>
  );
}

export function IconBtn({
  onClick,
  ariaLabel,
  children,
  className = "",
}: {
  onClick: () => void;
  ariaLabel: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      className={`w-[35px] h-[35px] p-[7.95px] border-none rounded-[50.91px] bg-[#2d2d2d] flex items-center justify-center cursor-pointer shrink-0 box-border transition-[background] duration-150 hover:bg-[#3a3a3a] ${className}`}
    >
      {children}
    </button>
  );
}

export function BuyCryptoBlock({
  msg,
}: {
  msg: Message;
}) {
  const [step, setStep] = useState<"summary" | "transfer" | "done">("summary");

  const amount = msg.transactionParams?.amount || "23";
  const token = msg.transactionParams?.token?.toUpperCase() || "USDC Solana";
  const ngnAmount = (Number(amount) * 1387.45).toFixed(2); // Mock exchange rate

  if (step === "done") {
    return (
      <div className="flex flex-col gap-3">
        {msg.text && (
          <div className="max-w-[324px] w-full ml-0 mr-auto flex flex-col gap-[6px] self-start mt-1">
            <div className="m-0 font-[Geist,sans-serif] font-normal text-sm leading-[145%] text-[#d5d5d5] whitespace-pre-wrap overflow-anywhere wrap-break-word">
              <TextWithLinks text={msg.text} />
            </div>
          </div>
        )}
        <div className="w-full self-start max-w-[324px] bg-[#161616] rounded-2xl p-5 box-border mt-2">
          <h3 className="m-0 text-white font-bold text-lg mb-2">Transfer Done !</h3>
          <p className="m-0 text-[#909090] text-sm leading-[1.4] mb-5">
            Got it! We'll track your payment automatically. Your balance will be updated within a few seconds once confirmed by the bank.
          </p>
          <button
            onClick={() => {}}
            className="w-full py-3 rounded-xl bg-[#7c5cfc] text-white font-semibold text-sm border-none cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    );
  }

  if (step === "transfer") {
    return (
      <div className="flex flex-col gap-3">
        {msg.text && (
          <div className="max-w-[324px] w-full ml-0 mr-auto flex flex-col gap-[6px] self-start mt-1">
            <div className="m-0 font-[Geist,sans-serif] font-normal text-sm leading-[145%] text-[#d5d5d5] whitespace-pre-wrap overflow-anywhere wrap-break-word">
              <TextWithLinks text={msg.text} />
            </div>
          </div>
        )}
        <div className="w-full self-start max-w-[324px] bg-[#161616] rounded-2xl p-5 box-border mt-2 flex flex-col gap-4">
          <div className="flex items-center gap-2 text-[#d5d5d5] text-sm">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 7V5a2 2 0 0 1 2-2h2M17 3h2a2 2 0 0 1 2 2v2M21 17v2a2 2 0 0 1-2 2h-2M7 21H5a2 2 0 0 1-2-2v-2" />
              <circle cx="12" cy="12" r="2" />
            </svg>
            <span className="font-semibold text-xs leading-[1.4]">
              Transfer exactly <span className="font-bold">₦ {ngnAmount}</span> to the account below.
            </span>
          </div>

          <div className="flex flex-col gap-1 mt-1">
            <span className="text-[#909090] text-xs">Bank name</span>
            <span className="text-white font-bold text-sm">Moniepoint</span>
          </div>
          
          <div className="flex flex-col gap-1">
            <span className="text-[#909090] text-xs">Account name</span>
            <span className="text-white font-bold text-sm">Ndukwe Anita Checkout</span>
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-[#909090] text-xs">Account number</span>
            <div className="flex items-center gap-2">
              <span className="text-white font-bold text-sm">6098977654</span>
              <button className="bg-transparent border-none p-0 cursor-pointer flex items-center justify-center text-[#909090] hover:text-white transition-colors" onClick={() => navigator.clipboard.writeText("6098977654")}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                </svg>
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-[#909090] text-xs">Description</span>
            <input type="text" placeholder="Add note" className="w-full bg-transparent border border-[#333] rounded-xl px-4 py-2 text-white text-sm outline-none focus:border-[#7c5cfc] placeholder:text-[#5a5a5a]" />
          </div>

          <button
            onClick={() => setStep("done")}
            className="w-full py-3 rounded-xl bg-[#7c5cfc] text-white font-semibold text-sm border-none cursor-pointer mt-2"
          >
            I have made the transfer
          </button>
          
          <p className="m-0 text-center text-[#5a5a5a] text-[10px] px-2">
            Your crypto will be delivered automatically to your wallet once the transfer is confirmed
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {msg.text && (
        <div className="max-w-[324px] w-full ml-0 mr-auto flex flex-col gap-[6px] self-start mt-1">
          <div className="m-0 font-[Geist,sans-serif] font-normal text-sm leading-[145%] text-[#d5d5d5] whitespace-pre-wrap overflow-anywhere wrap-break-word">
            <TextWithLinks text={msg.text} />
          </div>
        </div>
      )}
      
      <div className="w-full self-start max-w-[324px] bg-[#161616] rounded-2xl p-5 box-border mt-2 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <span className="text-[#d5d5d5] text-xs font-medium">Buy Crypto</span>
          <div className="flex items-center gap-1 bg-[#222] px-3 py-1.5 rounded-full">
            <span className="text-[#d5d5d5] text-xs font-semibold">{token}</span>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#d5d5d5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </div>
        </div>

        <div className="flex items-center justify-between my-2">
          <div className="flex flex-col">
            <span className="text-[#d5d5d5] text-sm font-semibold mb-1">Pay ($)</span>
            <span className="text-white text-2xl font-bold">{amount}</span>
          </div>
          
          <div className="flex items-center justify-center shrink-0 mx-2 text-[#909090]">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M7 10l-4 4 4 4" />
              <path d="M21 14H3" />
              <path d="M17 4l4 4-4 4" />
              <path d="M3 8h18" />
            </svg>
          </div>

          <div className="flex flex-col items-end">
            <span className="text-[#d5d5d5] text-sm font-semibold mb-1">You receive (NGN)</span>
            <span className="text-white text-2xl font-bold">{ngnAmount}</span>
          </div>
        </div>

        <div className="flex flex-col gap-2 mt-2">
          <div className="flex items-center justify-between">
            <span className="text-[#909090] text-xs font-medium">Exchange rate</span>
            <span className="text-white text-xs font-bold">1 USD = ₦ 1,387.45</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[#909090] text-xs font-medium">Fee</span>
            <span className="text-white text-xs font-bold">$ 0.05</span>
          </div>
        </div>

        <button
          onClick={() => setStep("transfer")}
          className="w-full py-3 rounded-xl bg-[#7c5cfc] text-white font-semibold text-sm border-none cursor-pointer mt-3 transition-opacity hover:opacity-90 active:scale-[0.98]"
        >
          Make payment
        </button>
      </div>
    </div>
  );
}
