import { ChevronRight } from "lucide-react";
import SheetShell from "./sheet-shell";
import type { SendMethod } from "../types";

type SendMethodSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectMethod: (method: SendMethod) => void;
};

export default function SendMethodSheet({
  open,
  onOpenChange,
  onSelectMethod,
}: SendMethodSheetProps) {
  return (
    <SheetShell
      open={open}
      onOpenChange={onOpenChange}
      title="Send"
      description="Choose a method below to add funds to your account."
    >
      <div className="space-y-3">
        <button
          type="button"
          onClick={() => onSelectMethod("bank-transfer")}
          className="w-full rounded-2xl bg-zinc-800 px-5 py-4 text-left transition hover:bg-zinc-700"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xl font-medium text-white">Bank Transfer</p>
              <p className="text-sm text-zinc-400">Deposit from your bank account.</p>
            </div>
            <ChevronRight className="h-5 w-5 text-zinc-500" />
          </div>
        </button>
        <button
          type="button"
          onClick={() => onSelectMethod("crypto")}
          className="w-full rounded-2xl bg-zinc-800 px-5 py-4 text-left transition hover:bg-zinc-700"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xl font-medium text-white">Crypto</p>
              <p className="text-sm text-zinc-400">Receive crypto coins.</p>
            </div>
            <ChevronRight className="h-5 w-5 text-zinc-500" />
          </div>
        </button>
      </div>
    </SheetShell>
  );
}
