import { useState, useRef, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function VerifyEmail() {
    const router = useRouter();
    const searchParams = useSearchParams();
    
    // Retrieves the email passed from the previous screen, or uses a fallback
    const email = searchParams.get("email") || "J********@gmail.com";

    const [otp, setOtp] = useState(["", "", "", "", ""]);
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState<"idle" | "error" | "success">("idle");
    const [timeLeft, setTimeLeft] = useState(267); // 4:27 in seconds
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    // --- MOCK TIMER ---
    useEffect(() => {
        if (timeLeft <= 0) return;
        const timerId = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
        return () => clearInterval(timerId);
    }, [timeLeft]);

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s < 10 ? "0" : ""}${s}`;
    };

    // --- INPUT LOGIC ---
    const handleChange = (index: number, value: string) => {
        // Reset status if user starts typing after an error
        if (status !== "idle") setStatus("idle");

        if (value.length > 1) value = value.slice(-1); // Prevent multiple chars
        
        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        // Auto-focus next input
        if (value && index < 4) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        // Auto-focus previous input on backspace
        if (e.key === "Backspace" && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handleVerify = async () => {
        const code = otp.join("");
        if (code.length !== 5) return;

        setLoading(true);
        setStatus("idle");
        
        // Dummy API verification delay
        await new Promise((resolve) => setTimeout(resolve, 1000));
        
        if (code === "12345") {
            setStatus("success");
            setTimeout(() => router.push("/login"), 1500); // Route somewhere on success
        } else {
            setStatus("error");
        }
        
        setLoading(false);
    };

    const isComplete = otp.every((val) => val !== "");

    return (
        <div className="fixed inset-0 w-full h-dvh bg-black text-white flex flex-col justify-center items-center px-6 py-40">
            
            {/* --- HEADER --- */}
            <div className="mt-8 text-center w-full">
                <h1 className="text-2xl font-bold mb-3">Verify email address</h1>
                <p className="text-[#A1A1AA] text-[14px]">Verify your email address below to continue.</p>
                <p className="text-[#A1A1AA] text-[14px] mt-6 px-4 leading-relaxed">
                    Enter the 5 digit code sent to your email address <br />
                    <span className="font-medium text-white">{email}</span>
                </p>
            </div>

            {/* --- OTP BOXES --- */}
            <div className="flex gap-3 justify-center mt-8">
                {otp.map((value, index) => {
                    // Determine styling based on state
                    let boxStyle = "bg-[#262626] text-white"; // Empty
                    if (status === "error") {
                        boxStyle = "bg-[#FEE2E2] text-[#EF4444] border border-[#EF4444]";
                    } else if (status === "success") {
                        boxStyle = "bg-[#D1FAE5] text-[#10B981] border border-[#10B981]";
                    } else if (value) {
                        boxStyle = "bg-white text-black"; // Filled
                    }

                    return (
                        <input
                            key={index}
                            ref={(el) => { inputRefs.current[index] = el; }}
                            type="text"
                            inputMode="numeric"
                            maxLength={1}
                            value={value}
                            onChange={(e) => handleChange(index, e.target.value)}
                            onKeyDown={(e) => handleKeyDown(index, e)}
                            className={`w-12 h-14 sm:w-14 sm:h-16 text-center text-2xl font-bold rounded-xl outline-none transition-colors duration-200 ${boxStyle}`}
                        />
                    );
                })}
            </div>

            {/* --- TIMER & RESEND --- */}
            <div className="mt-8 text-center space-y-4">
                <p className="text-[#A1A1AA] text-sm">Code expires in <span className="text-white font-medium">{formatTime(timeLeft)}s</span></p>
                <p className="text-[#A1A1AA] text-sm">
                    Didn't get code <button className="text-[#8B5CF6] font-semibold hover:underline ml-1">Resend Code</button>
                </p>
            </div>

            {/* --- BOTTOM SECTION --- */}
            <div className="mt-auto pb-6 w-full max-w-md">
                <Button
                    onClick={handleVerify}
                    disabled={!isComplete || loading}
                    className={`w-full h-14 rounded-xl text-white font-semibold text-base transition-colors ${
                        isComplete 
                            ? "bg-[#8B5CF6] hover:bg-[#7C3AED]" 
                            : "bg-[#A78BFA]/60 cursor-not-allowed"
                    }`}
                >
                    {loading ? "Verifying..." : "Verify Email"}
                </Button>

                <div className="text-center mt-6">
                    <button 
                        onClick={() => router.push("/login")}
                        className="text-[#A1A1AA] text-sm hover:text-white transition-colors bg-none border-none cursor-pointer"
                    >
                        Already have an account? <span className="text-[#8B5CF6] font-semibold">Log in</span>
                    </button>
                </div>
            </div>

        </div>
    );
}