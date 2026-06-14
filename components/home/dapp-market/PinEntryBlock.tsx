import NumericKeyboard from '@/components/pin/NumericKeyboard';
import type { PinStatus } from './borrow-flow.types';
import { WALLET_PIN_LENGTH } from '@/lib/wallet-pin';

type PinEntryBlockProps = {
  pin: string;
  pinStatus: PinStatus;
  onKeyPress: (key: string) => void;
  onDone: () => void;
};

function PinDots({ pin, pinStatus }: { pin: string; pinStatus: PinStatus }) {
  return (
    <div className="flex justify-center gap-3">
      {Array.from({ length: WALLET_PIN_LENGTH }, (_, index) => {
        const isFilled = index < pin.length;
        const stateClass = pinStatus === 'error' ? 'border-[#ef4444]' : pinStatus === 'success' ? 'border-[#22c55e]' : 'border-[#8a8a8a]';

        return (
          <div key={index} className={`w-[52px] h-[52px] rounded-[10px] border bg-[#353535] inline-flex items-center justify-center ${stateClass}`}>
            {isFilled ? <span className="w-3.5 h-3.5 rounded-full bg-white" /> : null}
          </div>
        );
      })}
    </div>
  );
}

export default function PinEntryBlock({ pin, pinStatus, onKeyPress, onDone }: PinEntryBlockProps) {
  return (
    <>
      <section className="rounded-[20px] bg-[#2d2d2d] p-[15px] flex flex-col gap-3.5 items-center py-[22px]">
        <p className="m-0 text-[#d5d5d5] text-xs leading-[1.45]">Enter your pin</p>
        <PinDots pin={pin} pinStatus={pinStatus} />
        <div className="mt-2.5 flex items-center justify-between text-[#8b8b93] text-xs w-full px-1">
          <span>Jumpa Secure Numeric Keypad</span>
          <button type="button" className="text-white font-semibold cursor-pointer bg-transparent border-none" onClick={onDone}>Done</button>
        </div>
      </section>

      <NumericKeyboard onKeyPress={onKeyPress} />
    </>
  );
}