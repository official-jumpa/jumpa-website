import { useRef, useEffect } from "react";
import { type Message } from "./chat-types";
import { UserBubble, UserMediaBubble } from "./UserMessageBubble";
import { AiTextBlock, ThinkingRow } from "./AiMessageBubble";
import { TransactionBlock } from "./TransactionIntentCard";
import { BuyCryptoBlock } from "./OnrampCheckoutCard";

interface ChatMessageListProps {
  messages: Message[];
  showTyping: boolean;
  onTransactionClick: (msg: Message) => void;
  onOnrampInitiated?: (msgId: string, reference: string, deposit: any) => void;
  isGroupChat?: boolean;
}

export default function ChatMessageList({
  messages,
  showTyping,
  onTransactionClick,
  onOnrampInitiated,
  isGroupChat = false,
}: ChatMessageListProps) {
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      endRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
    return () => clearTimeout(timer);
  }, [messages, showTyping]);

  const lastTransactionMsgId = [...messages]
    .reverse()
    .find((m) => m.isTransaction && m.transactionParams?.type !== "onramp")?.id;

  // Only the most recent onramp card is interactive; older ones collapse to text
  const lastOnrampMsgId = [...messages]
    .reverse()
    .find((m) => m.isTransaction && m.transactionParams?.type === "onramp")?.id;

  return (
    <div className="ai-chat-messages flex-1 min-h-0 overflow-y-auto px-6 pt-3">
      {isGroupChat && (
        <div className="flex justify-center mb-5">
          <div className="bg-[#2D2D2D] text-[#DFDFDF] px-[10px] py-[10px] rounded-xl text-sm font-normal">
            Anita joined
          </div>
        </div>
      )}

      {messages.map((m) => {
        if (isGroupChat && m.isOtherUser) {
          return (
            <div key={m.id} className="flex justify-start mb-5">
              <div className="bg-[#2D2D2D] text-[#D5D5D5] p-[10px] rounded-[18px] text-xs font-normal">
                {m.text}
              </div>
            </div>
          );
        }

        return (
          <div
            key={m.id}
            className={`mb-4 flex flex-col ${m.role === "user" ? "items-end" : "items-start"}`}
          >
            {m.role === "user" ? (
              m.imageUrls?.length ? (
                <UserMediaBubble imageUrls={m.imageUrls} text={m.text} />
              ) : (
                <UserBubble text={m.text} isVoice={m.isVoice} />
              )
            ) : m.isTransaction ? (
              m.transactionParams?.type === "onramp" ? (
                <BuyCryptoBlock
                  msg={m}
                  disabled={m.id !== lastOnrampMsgId}
                  onInitiated={onOnrampInitiated
                    ? (ref, dep) => onOnrampInitiated(m.id, ref, dep)
                    : undefined
                  }
                />
              ) : (
                <TransactionBlock
                  msg={m}
                  onTransactionClick={onTransactionClick}
                  disabled={m.id !== lastTransactionMsgId}
                />
              )
            ) : (
              <AiTextBlock text={m.text} />
            )}
          </div>
        );
      })}

      {showTyping && <ThinkingRow />}
      <div ref={endRef} />
    </div>
  );
}
