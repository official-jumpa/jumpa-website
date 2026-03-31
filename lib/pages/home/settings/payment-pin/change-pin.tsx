import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { X, Lock, Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { changePin } from "@/lib/api";

/**
 * Change Payment PIN — 3 steps:
 * 1. Enter current PIN (verify it)
 * 2. Enter new PIN
 * 3. Confirm new PIN → POST /api/pin/change
 */
type Step = 1 | 2 | 3;

export default function ChangePaymentPin() {
    const router = useRouter();

    const [step, setStep] = useState<Step>(1);
    const [currentPin, setCurrentPin] = useState("");
    const [newPin, setNewPin] = useState("");
    const [confirmPin, setConfirmPin] = useState("");
    const [isVisible, setIsVisible] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    // The active pin buffer based on current step
    const activePin = step === 1 ? currentPin : step === 2 ? newPin : confirmPin;
    const setActivePin = step === 1 ? setCurrentPin : step === 2 ? setNewPin : setConfirmPin;

    const stepLabels: Record<Step, string> = {
        1: "Enter current PIN",
        2: "Enter new PIN",
        3: "Confirm new PIN",
    };

    const handlePinPress = (num: string) => {
        if (loading) return;
        if (num === "x") {
            setActivePin((p) => p.slice(0, -1));
            setError(null);
            return;
        }
        if (activePin.length < 4) {
            setActivePin((p) => p + num);
        }
    };

    const handleConfirm = async () => {
        if (loading) return;
        setError(null);

        if (step === 1) {
            setStep(2);
            return;
        }

        if (step === 2) {
            setStep(3);
            return;
        }

        // Step 3: validate and submit
        if (confirmPin !== newPin) {
            console.warn("[ChangePin] New PIN mismatch");
            setError("PINs do not match — try again");
            setConfirmPin("");
            return;
        }

        setLoading(true);
        const res = await changePin(currentPin, confirmPin);

        if (res.error || !res.data) {
            setError(res.error ?? "Failed to change PIN. Check your current PIN.");
            setLoading(false);
            return;
        }

        setSuccess(true);
        setLoading(false);
    };

    if (success) {
        return (
            <div className="fixed inset-0 bg-white flex flex-col items-center justify-center gap-4 px-6">
                <div className="w-16 h-16 bg-[#E6F6E9] rounded-full flex items-center justify-center mb-2">
                    <Lock className="w-8 h-8 text-[#01C259]" strokeWidth={2.5} />
                </div>
                <h2 className="text-2xl font-bold text-black">PIN Changed!</h2>
                <p className="text-gray-400 text-sm text-center">Your payment PIN has been updated.</p>
                <Button
                    className="w-full max-w-xs h-14 bg-[#01C259] hover:bg-[#65ad77] text-white text-base font-medium rounded-xl mt-4"
                    onClick={() => router.back()}
                >
                    Done
                </Button>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-white flex flex-col h-full">

            {/* Top Nav */}
            <div className="px-6 pt-12 pb-4">
                <button onClick={() => router.back()} className="p-2 -ml-2 rounded-full hover:bg-gray-100 transition-colors">
                    <X className="w-6 h-6 text-black" />
                </button>
            </div>

            {/* Main */}
            <div className="flex-1 flex flex-col px-6">
                <div className="mb-10 mt-2">
                    <div className="flex items-center gap-4 mb-2">
                        <div className="w-12 h-12 bg-[#E6F6E9] rounded-full flex items-center justify-center">
                            <Lock className="w-6 h-6 text-[#01C259]" strokeWidth={2.5} />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-black tracking-tight">Change Payment PIN</h1>
                            <p className="text-gray-400 text-sm">Step {step} of 3</p>
                        </div>
                    </div>
                </div>

                {/* PIN dots */}
                <div className="mb-8">
                    <p className="text-gray-400 text-sm mb-4">{stepLabels[step]}</p>
                    <div className="flex items-center gap-4">
                        <div className="flex gap-3">
                            {[0, 1, 2, 3].map((i) => (
                                <div
                                    key={i}
                                    className={`w-14 h-14 rounded-xl flex items-center justify-center transition-all bg-[#EBEBEB]
                                        ${activePin.length > i ? "border border-green-500" : "border border-transparent"}`}
                                >
                                    {activePin.length > i && (
                                        isVisible
                                            ? <span className="text-xl font-bold">{activePin[i]}</span>
                                            : <div className="w-3 h-3 bg-black rounded-full" />
                                    )}
                                </div>
                            ))}
                        </div>
                        <button onClick={() => setIsVisible((v) => !v)} className="ml-2 text-gray-400 hover:text-gray-600">
                            {isVisible ? <EyeOff className="w-6 h-6" /> : <Eye className="w-6 h-6" />}
                        </button>
                    </div>

                    {error && (
                        <p className="text-red-500 text-xs mt-3">{error}</p>
                    )}
                </div>

                {/* Confirm CTA */}
                <Button
                    className="w-full h-14 bg-[#01C259] hover:bg-[#65ad77] text-white text-lg font-medium rounded-xl shadow-none"
                    disabled={activePin.length < 4 || loading}
                    onClick={handleConfirm}
                >
                    {loading ? "Updating..." : step < 3 ? "Next" : "Confirm"}
                </Button>
            </div>

            {/* Keypad */}
            <div className="bg-[#F9FAFB] p-2 pb-8 rounded-t-[32px] animate-in slide-in-from-bottom duration-300">
                <div className="flex justify-between px-6 py-3 mb-1 text-[11px] font-semibold tracking-wide">
                    <span className="text-gray-500">Jumpa Secure Numeric Keypad</span>
                    <button className="text-[#01C259] hover:text-green-700" onClick={handleConfirm} disabled={activePin.length < 4}>Done</button>
                </div>
                <div className="grid grid-cols-3 gap-2 px-2">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                        <button
                            key={num}
                            onClick={() => handlePinPress(num.toString())}
                            className="h-12 bg-white rounded-lg shadow-[0_1px_2px_rgba(0,0,0,0.05)] text-xl font-semibold text-black active:bg-gray-100 transition-colors"
                        >
                            {num}
                        </button>
                    ))}
                    <div className="h-12" />
                    <button onClick={() => handlePinPress("0")} className="h-12 bg-white rounded-lg shadow-[0_1px_2px_rgba(0,0,0,0.05)] text-xl font-semibold text-black active:bg-gray-100 transition-colors">0</button>
                    <button onClick={() => handlePinPress("x")} className="h-12 bg-white rounded-lg shadow-[0_1px_2px_rgba(0,0,0,0.05)] flex items-center justify-center active:bg-gray-100 transition-colors">
                        <span className="text-lg font-medium text-black">x</span>
                    </button>
                </div>
            </div>
        </div>
    );
}