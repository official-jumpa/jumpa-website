import NumericKeyboard from '@/components/pin/NumericKeyboard';
import type { PinStatus } from './borrow-flow.types';

type PinEntryBlockProps = {
  pin: string;
  pinStatus: PinStatus;
  onKeyPress: (key: string) => void;
  onDone: () => void;
};

function PinDots({ pin, pinStatus }: { pin: string; pinStatus: PinStatus }) {
  return (
    <div className="borrow-pin-dots">
      {[0, 1, 2, 3].map((index) => {
        const isFilled = index < pin.length;
        const stateClass = pinStatus === 'error' ? 'is-error' : pinStatus === 'success' ? 'is-success' : '';

        return (
          <div key={index} className={`borrow-pin-dot ${stateClass}`}>
            {isFilled ? <span className="borrow-pin-dot-fill" /> : null}
          </div>
        );
      })}
    </div>
  );
}

export default function PinEntryBlock({ pin, pinStatus, onKeyPress, onDone }: PinEntryBlockProps) {
  return (
    <>
      <section className="borrow-card borrow-pin-card">
        <p className="borrow-card-label">Enter your pin</p>
        <PinDots pin={pin} pinStatus={pinStatus} />
        <div className="borrow-pin-meta">
          <span>Jumpa Secure Numeric Keypad</span>
          <button type="button" onClick={onDone}>Done</button>
        </div>
      </section>

      <NumericKeyboard onKeyPress={onKeyPress} />
    </>
  );
}