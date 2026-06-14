import { vnIcon, cancelVnIcon, confirmVnIcon, processVnIcon, COMPOSER_ACTION_IMG } from "./chat-assets";
import { type VoiceFlow } from "./chat-types";

export function barsFromRecordingTick(tick: number) {
  return Math.min(14, Math.max(2, 2 + Math.floor(tick / 4)));
}

interface VoiceRecorderPanelProps {
  voiceFlow: VoiceFlow;
  recordingTick: number;
  voicePreviewBars: number;
  onRecordingCancel: () => void;
  onRecordingConfirmSend: () => void;
}

export default function VoiceRecorderPanel({
  voiceFlow,
  recordingTick,
  voicePreviewBars,
  onRecordingCancel,
  onRecordingConfirmSend,
}: VoiceRecorderPanelProps) {
  if (voiceFlow === "recording") {
    const n = barsFromRecordingTick(recordingTick);
    return (
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
    return (
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
  }
  return null;
}
