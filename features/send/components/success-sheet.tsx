import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import SheetShell from "./sheet-shell";

type SuccessSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDone: () => void;
  amount: string;
  tokenSymbol: string;
  hash: string;
};

const confettiColors = [
  "bg-red-500",
  "bg-yellow-400",
  "bg-cyan-400",
  "bg-green-400",
  "bg-violet-400",
  "bg-pink-500",
];

export default function SuccessSheet({ 
  open, 
  onOpenChange, 
  onDone,
  amount,
  tokenSymbol,
  hash
}: SuccessSheetProps) {
  return (
    <SheetShell open={open} onOpenChange={onOpenChange} title="" className="overflow-hidden">
      <div className="relative space-y-5 pb-2 pt-8">
        <div className="pointer-events-none absolute inset-x-0 -top-5 h-20">
          {confettiColors.map((color, index) => (
            <span
              key={`${color}-${index}`}
              className={`absolute h-2 w-6 rotate-12 rounded ${color}`}
              style={{ left: `${10 + index * 14}%`, top: `${(index % 3) * 14}%` }}
            />
          ))}
        </div>
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-500 text-white">
          <Check className="h-10 w-10" strokeWidth={4} />
        </div>
        <div className="text-center">
          <h3 className="text-2xl font-semibold text-white">Transaction Successful</h3>
          <p className="mt-2 text-lg text-zinc-300">You&apos;ve sent {amount} {tokenSymbol}</p>
        </div>

        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between border-b border-dotted border-zinc-600 pb-3 text-zinc-100">
            <span className="text-lg">Amount</span>
            <span className="text-xl">{amount} {tokenSymbol}</span>
          </div>
          <div className="flex flex-col border-b border-dotted border-zinc-600 pb-3 text-zinc-100">
            <span className="text-lg">Transaction Hash</span>
            <span className="text-sm break-all text-zinc-400">{hash}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 pt-3">
          <Button
            type="button"
            onClick={() => window.open(tokenSymbol === 'FLOW' ? `https://evm-testnet.flowscan.io/tx/${hash}` : `https://sepolia.etherscan.io/tx/${hash}`, '_blank')}
            className="h-14 rounded-xl bg-violet-500 text-xl text-white hover:bg-violet-400"
          >
            Explorer
          </Button>
          <Button
            type="button"
            onClick={onDone}
            className="h-14 rounded-xl bg-violet-200 text-xl text-violet-600 hover:bg-violet-100"
          >
            Done
          </Button>
        </div>
      </div>
    </SheetShell>
  );
}
