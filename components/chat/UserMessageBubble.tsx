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
