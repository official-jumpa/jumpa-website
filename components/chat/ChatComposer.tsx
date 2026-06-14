import { forwardRef, type ReactNode, type RefObject } from "react";
import { type VoiceFlow } from "./chat-types";
import ChatInputBar from "./ChatInputBar";
import VoiceRecorderPanel from "./VoiceRecorderPanel";

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
    const isVoice = voiceFlow !== "none";
    let row: ReactNode;

    if (voiceFlow === "recording" || voiceFlow === "sending") {
      row = (
        <VoiceRecorderPanel
          voiceFlow={voiceFlow}
          recordingTick={recordingTick}
          voicePreviewBars={voicePreviewBars}
          onRecordingCancel={onRecordingCancel}
          onRecordingConfirmSend={onRecordingConfirmSend}
        />
      );
    } else {
      row = (
        <ChatInputBar
          value={value}
          onChange={onChange}
          textAreaRef={textAreaRef}
          onMic={onMic}
          attachMenuOpen={attachMenuOpen}
          onAttachToggle={onAttachToggle}
          onAttachClose={onAttachClose}
          onTypingSend={onTypingSend}
          onIdleSendClick={onIdleSendClick}
          pendingAttachmentPreviews={pendingAttachmentPreviews}
          onRemovePendingAttachment={onRemovePendingAttachment}
          onImageFilesSelected={onImageFilesSelected}
          filesInputRef={filesInputRef}
          cameraInputRef={cameraInputRef}
          photosInputRef={photosInputRef}
        />
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
