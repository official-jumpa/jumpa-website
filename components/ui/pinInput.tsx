import { useRef } from "react";
import { WALLET_PIN_LENGTH } from "@/lib/wallet-pin";

// pin input
function PinInput({
    value,
    onChange,
    show,
}: {
    value: string;
    onChange: (val: string) => void;
    show?: boolean;
}) {
    const inputs = useRef<(HTMLInputElement | null)[]>([]); // Updated type

    const handleChange = (index: number, val: string) => {
        if (!/^\d?$/.test(val)) return;

        const next = value.split("");
        next[index] = val;
        const newValue = next.join("").slice(0, WALLET_PIN_LENGTH);

        onChange(newValue);

        if (val && index < WALLET_PIN_LENGTH - 1) {
            inputs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
        if (e.key === "Backspace" && !value[index] && index > 0) {
            inputs.current[index - 1]?.focus();
        }
    };

    return (
        <div className="flex gap-3">
            {Array.from({ length: WALLET_PIN_LENGTH }, (_, i) => (
                <input
                    key={i}
                    ref={(el) => {
                        inputs.current[i] = el; // Fixed: just assign, don't return
                    }}
                    type={show ? "text" : "password"}
                    inputMode="numeric"
                    maxLength={1}
                    value={value[i] ?? ""}
                    onChange={(e) => handleChange(i, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(i, e)}
                    className="
                        h-12 w-12
                        rounded-lg
                        border border-gray-300
                        text-center text-lg
                        focus:outline-none focus:ring-2 focus:ring-black
                    "
                />
            ))}
        </div>
    );
}
export { PinInput }