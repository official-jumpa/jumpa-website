import { useEffect, type RefObject } from "react";
import {
  fileMenuIcon,
  cameraMenuIcon,
  photoMenuIcon,
} from "./chat-assets";

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

export interface ChatInputBarProps {
  value: string;
  onChange: (v: string) => void;
  textAreaRef: RefObject<HTMLTextAreaElement | null>;
  onMic: () => void;
  attachMenuOpen: boolean;
  onAttachToggle: () => void;
  onAttachClose: () => void;
  onTypingSend: () => void;
  onIdleSendClick: () => void;
  pendingAttachmentPreviews: { id: string; url: string }[];
  onRemovePendingAttachment: (id: string) => void;
  onImageFilesSelected: (files: FileList | null) => void;
  filesInputRef: RefObject<HTMLInputElement | null>;
  cameraInputRef: RefObject<HTMLInputElement | null>;
  photosInputRef: RefObject<HTMLInputElement | null>;
}

export default function ChatInputBar({
  value,
  onChange,
  textAreaRef,
  onMic,
  attachMenuOpen,
  onAttachToggle,
  onAttachClose,
  onTypingSend,
  onIdleSendClick,
  pendingAttachmentPreviews,
  onRemovePendingAttachment,
  onImageFilesSelected,
  filesInputRef,
  cameraInputRef,
  photosInputRef,
}: ChatInputBarProps) {
  useAutosizeTextArea(textAreaRef, value, pendingAttachmentPreviews.length);

  useEffect(() => {
    if (!attachMenuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onAttachClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [attachMenuOpen, onAttachClose]);

  return (
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
