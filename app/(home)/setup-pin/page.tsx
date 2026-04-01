"use client"

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Delete, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSession } from "@/lib/auth-client";
import { saveWalletLocally } from "@/lib/wallet";

export default function SetupPinPage() {
    const router = useRouter();
    const { data: session, isPending } = useSession();
    const [pin, setPin] = useState("");
    const [confirmPin, setConfirmPin] = useState("");
    const [step, setStep] = useState<1 | 2>(1); // 1: Enter, 2: Confirm
    const [error, setError] = useState<string | null>(null);
    const [isSettingUp, setIsSettingUp] = useState(false);

    // Skip PIN setup if user already has a wallet
    useEffect(() => {
        const checkExistingWallet = async () => {
            if (isPending || !session) return;
            
            try {
                const res = await fetch("/api/user/wallet");
                if (res.ok) {
                    const data = await res.json();
                    if (data.address) {
                        console.log("[SetupPin] Wallet already exists, redirecting...");
                        saveWalletLocally({
                            address: data.address,
                            addresses: data.addresses,
                        });
                        router.push("/home");
                    }
                }
            } catch (err) {
                console.error("[SetupPin] Error checking existing wallet:", err);
            }
        };

        checkExistingWallet();
    }, [session, isPending, router]);

    const handleNumberClick = (num: string) => {
        setError(null);
        if (step === 1) {
            if (pin.length < 4) {
                const newPin = pin + num;
                setPin(newPin);
                if (newPin.length === 4) {
                    // Slight delay for visual feedback before auto-advancing
                    setTimeout(() => setStep(2), 200);
                }
            }
        } else {
            if (confirmPin.length < 4) {
                const newConfirm = confirmPin + num;
                setConfirmPin(newConfirm);
                if (newConfirm.length === 4) {
                    // Auto-submit when confirmation PIN is complete
                    setTimeout(() => handleAutoSubmit(pin, newConfirm), 200);
                }
            }
        }
    };

    const handleAutoSubmit = async (p: string, cp: string) => {
        if (p === cp) {
            setIsSettingUp(true);
            setError(null);
            try {
                const response = await fetch("/api/auth/social-setup", {
                    method: "POST",
                    body: JSON.stringify({ pin: p }),
                });
                const resData = await response.json();
                
                if (response.ok) {
                    saveWalletLocally({
                        address: resData.address,
                        addresses: resData.addresses,
                    });
                    router.push("/home");
                } else {
                    setError(resData.error || "Failed to set up wallet");
                    setConfirmPin("");
                    setStep(1); // Reset to first step on error
                }
            } catch (err) {
                setError("Network error. Please check your connection.");
            } finally {
                setIsSettingUp(false);
            }
        } else {
            setError("PINs do not match. Please try again.");
            setConfirmPin("");
            // Optional: short delay before shaking or resetting
        }
    };

    const handleDelete = () => {
        if (step === 1) {
            setPin(prev => prev.slice(0, -1));
        } else {
            setConfirmPin(prev => prev.slice(0, -1));
        }
    };

    const handleContinue = async () => {
        if (step === 1) {
            if (pin.length === 4) setStep(2);
        } else {
            if (confirmPin.length === 4) handleAutoSubmit(pin, confirmPin);
        }
    };

    const renderDots = (value: string) => {
        return (
            <div className="flex gap-4 mb-4">
                {[0, 1, 2, 3].map((i) => (
                    <motion.div
                        key={i}
                        initial={false}
                        animate={{
                            scale: value.length > i ? 1.2 : 1,
                            backgroundColor: value.length > i ? "#8B5CF6" : "#262626"
                        }}
                        className="w-3.5 h-3.5 rounded-full border border-[#333]"
                    />
                ))}
            </div>
        );
    };

    return (
        <div className="fixed inset-0 bg-[#050505] text-white flex flex-col items-center px-6 pt-6 pb-4 overflow-hidden">
            <div className="w-full max-w-md flex flex-col h-full">
                
                {/* Back Button */}
                <button
                    onClick={() => step === 2 ? setStep(1) : router.back()}
                    className="w-9 h-9 rounded-full bg-[#18181A] flex items-center justify-center mb-6 hover:bg-[#262626] transition-colors"
                >
                    <ArrowLeft className="w-4 h-4 text-white/70" />
                </button>

                {/* Title & Description */}
                <div className="mb-6">
                    <h1 className="text-2xl font-bold tracking-tight mb-2 leading-tight">
                        {step === 1 ? "Create your\nTransaction PIN" : "Confirm your\nTransaction PIN"}
                    </h1>
                    <p className="text-[#A1A1AA] text-[14px] leading-relaxed">
                        {step === 1 
                            ? "This 4-digit PIN will be used to encrypt your wallet and authorize all your transactions."
                            : "Please re-enter your PIN to confirm it's correct."
                        }
                    </p>
                </div>

                {/* PIN Display */}
                <div className="flex flex-col items-center justify-start py-2">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={step}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="flex flex-col items-center"
                        >
                            {renderDots(step === 1 ? pin : confirmPin)}
                            {error && (
                                <motion.p 
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="text-red-400 text-xs font-medium"
                                >
                                    {error}
                                </motion.p>
                            )}
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* Number Pad Area - Stick to bottom */}
                <div className="mt-auto w-full">
                    <div className="grid grid-cols-3 gap-y-2 gap-x-8 w-full mb-6">
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                            <button
                                key={num}
                                onClick={() => handleNumberClick(num.toString())}
                                className="h-14 text-2xl font-medium flex items-center justify-center hover:bg-white/5 rounded-full active:scale-90 transition-all"
                            >
                                {num}
                            </button>
                        ))}
                        <div className="empty" />
                        <button
                            onClick={() => handleNumberClick("0")}
                            className="h-14 text-2xl font-medium flex items-center justify-center hover:bg-white/5 rounded-full active:scale-90 transition-all"
                        >
                            0
                        </button>
                        <button
                            onClick={handleDelete}
                            className="h-14 text-2xl font-medium flex items-center justify-center hover:bg-white/5 rounded-full active:scale-90 transition-all text-[#A1A1AA]"
                        >
                            <Delete className="w-7 h-7" />
                        </button>
                    </div>

                    <Button
                        onClick={handleContinue}
                        disabled={(step === 1 ? pin.length : confirmPin.length) !== 4 || isSettingUp}
                        className={`w-full h-12 rounded-xl font-semibold text-base transition-all shadow-xl flex items-center justify-center gap-2
                            ${(step === 1 ? pin.length : confirmPin.length) === 4 && !isSettingUp
                                ? "bg-[#8B5CF6] text-white hover:bg-[#7C3AED]"
                                : "bg-[#262626] text-[#555] opacity-50"
                            }`}
                    >
                        {isSettingUp ? "Setting up..." : (step === 1 ? "Continue" : "Set PIN")}
                        {!isSettingUp && <ChevronRight className="w-4 h-4" />}
                    </Button>
                </div>
            </div>
        </div>
    );
}
