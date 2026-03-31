"use client"

import { useState, useEffect } from "react";
import { useRouter } from 'next/navigation';
import { Eye, EyeOff } from "lucide-react";
import { login, getMe } from "@/lib/api";
import { getStoredWallet, saveWalletLocally } from '@/lib/wallet';

/**
 * Login screen — password-based unlock.
 * - If an active session already exists → skip to /home
 * - Otherwise: reads address from localStorage, verifies password to login
 */
export default function LoginForm() {
    const router = useRouter();
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [checkingSession, setCheckingSession] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const storedWallet = getStoredWallet();

    // Check for existing session on mount — redirect to /home if already logged in
    useEffect(() => {
        if (!storedWallet) {
            setCheckingSession(false);
            router.replace("/onboarding");
            return;
        }
        getMe().then((res) => {
            if (res.data) {
                router.replace("/home");
            } else {
                setCheckingSession(false);
            }
        });
    }, [router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!password || loading || !storedWallet) return;

        setError(null);
        setLoading(true);

        const res = await login(storedWallet.address, password);

        if (res.error || !res.data) {
            setError(res.error ?? "Login failed. Check your password and try again.");
            setLoading(false);
            return;
        }

        saveWalletLocally({
            address: res.data.address,
            addresses: res.data.addresses,
        });

        setLoading(false);
        router.replace("/home");
    };

    if (checkingSession) {
        return (
            <div className="min-h-dvh w-full bg-black flex items-center justify-center">
                <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            </div>
        );
    }

    if (!storedWallet) return null;

    const displayAddress = `${storedWallet.address.slice(0, 10)}...${storedWallet.address.slice(-6)}`;

    return (
        <div className="min-h-dvh w-full bg-black text-white flex flex-col items-center justify-center px-6">
            <div className="w-full max-w-sm flex flex-col gap-6">

                <div className="text-center mb-2">
                    <h1 className="text-3xl font-bold mb-2">Welcome back!</h1>
                    <p className="text-[#A1A1AA] text-sm">Enter your password to unlock your wallet.</p>
                    <p className="text-[#52525B] text-xs mt-2 font-mono">{displayAddress}</p>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <div className="relative">
                        <input
                            type={showPassword ? "text" : "password"}
                            placeholder="Password"
                            value={password}
                            onChange={(e) => { setPassword(e.target.value); setError(null); }}
                            autoFocus
                            className="w-full h-14 bg-[#1C1C1E] border border-[#333333] rounded-xl px-4 pr-12 text-white placeholder:text-[#52525B] focus:outline-none focus:border-[#8B5CF6] text-sm"
                        />
                        <button type="button" onClick={() => setShowPassword((v) => !v)} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#A1A1AA]">
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                    </div>

                    {error && <p className="text-red-400 text-xs -mt-2">{error}</p>}

                    <button
                        type="submit"
                        disabled={!password || loading}
                        className="w-full h-14 rounded-xl bg-[#7C3AED] hover:bg-[#6D28D9] disabled:opacity-50 text-white font-semibold text-base transition-colors"
                    >
                        {loading ? "Verifying..." : "Unlock Wallet"}
                    </button>
                </form>

                <div className="text-center">
                    <button
                        onClick={() => { router.push("/forgot-password-email"); }}
                        className="text-[#A1A1AA] text-sm hover:text-white transition-colors"
                    >
                        Forgot password?
                    </button>
                </div>
            </div>
        </div>
    );
}