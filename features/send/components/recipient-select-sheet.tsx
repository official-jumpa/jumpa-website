import type { Recipient } from "../types";
import SheetShell from "./sheet-shell";

type RecipientSelectSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  recipients: Recipient[];
  selectedRecipientId: string;
  onSelectRecipient: (recipient: Recipient) => void;
};

function Avatar({ recipient }: { recipient: Recipient }) {
  if (recipient.avatar) {
    return (
      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-zinc-600 text-xs font-semibold text-white">
        {recipient.avatar}
      </div>
    );
  }
  return <div className="h-11 w-11 rounded-full bg-zinc-100" />;
}

export default function RecipientSelectSheet({
  open,
  onOpenChange,
  recipients,
  selectedRecipientId,
  onSelectRecipient,
}: RecipientSelectSheetProps) {
  return (
    <SheetShell open={open} onOpenChange={onOpenChange} title="Suggested recipient">
      <div className="max-h-[50vh] space-y-2 overflow-y-auto pb-3">
        {recipients.map((recipient) => {
          const selected = recipient.id === selectedRecipientId;
          return (
            <button
              type="button"
              key={recipient.id}
              onClick={() => onSelectRecipient(recipient)}
              className="flex w-full items-center gap-3 rounded-2xl bg-zinc-800 px-4 py-3 text-left transition hover:bg-zinc-700"
            >
              <Avatar recipient={recipient} />
              <div className="flex-1">
                <p className="text-lg font-medium text-white">{recipient.name}</p>
                <p className="text-sm text-zinc-500">{recipient.address}</p>
              </div>
              <span
                aria-hidden
                className={`inline-flex h-7 w-7 items-center justify-center rounded-full border ${
                  selected ? "border-violet-400" : "border-zinc-400"
                }`}
              >
                {selected ? <span className="h-4 w-4 rounded-full bg-violet-500" /> : null}
              </span>
            </button>
          );
        })}
      </div>
    </SheetShell>
  );
}
