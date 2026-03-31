import { signIn } from "@/lib/auth-client";
import { useRouter } from 'next/navigation';
import { X } from "lucide-react";
import { useState } from "react";
import {
    Drawer,
    DrawerContent,
    DrawerTitle,
    DrawerTrigger,
    DrawerClose,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";

/**
 * "I have an existing wallet" entry point on the onboarding screen.
 * Provides two paths:
 * 1. Import via Secret Recovery Phrase → /save-recovery (import flow)
 * 2. (Future) Connect hardware wallet / other methods
 */
export default function LoginDrawer() {
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(false);

    const handleImportPhrase = () => {
        setIsOpen(false);
        router.push("/create-account?action=import");
    };

    const handleGoogleLogin = async () => {
        try {
            console.log("[LoginDrawer] Initiating Google Login...");
            await signIn.social({
                provider: "google",
                callbackURL: "/setup-pin",
            });
        } catch (error) {
            console.error("[LoginDrawer] Google sign-in failed:", error);
        }
    };

    return (
        <Drawer open={isOpen} onOpenChange={setIsOpen}>
            <DrawerTrigger asChild>
                <Button className="w-full h-14 rounded-xl bg-[#3F443F] hover:bg-[#323632] text-white font-medium text-base shadow-none transition-all active:scale-[0.98]">
                    I have an existing wallet
                </Button>
            </DrawerTrigger>

            <DrawerContent
                style={{ fontFamily: "Geist" }}
                className="bg-black border-none text-white px-6 pb-12 pt-4 rounded-t-[40px] h-[450px]"
            >
                {/* Hidden title for Radix accessibility requirement */}
                <DrawerTitle className="sr-only">Sign in to Jumpa</DrawerTitle>

                <div className="mx-auto w-full max-w-md h-full flex flex-col pt-4">

                    {/* Header with Close Button */}
                    <div className="flex justify-end pr-2">
                        <DrawerClose asChild>
                            <button className="w-10 h-10 rounded-full bg-[#1C1C1C] flex items-center justify-center hover:bg-[#262626] transition-colors">
                                <X className="w-5 h-5 text-[#888]" />
                            </button>
                        </DrawerClose>
                    </div>

                    <div className="flex-1 flex flex-col justify-center gap-4 px-2 -mt-4">
                        {/* Sign in with Google */}
                        <Button
                            type="button"
                            onClick={handleGoogleLogin}
                            className="w-full h-16 rounded-[20px] bg-white hover:bg-gray-100 text-black font-semibold text-lg flex items-center justify-center gap-3 shadow-sm transition-all active:scale-[0.98]"
                        >
                            <svg className="w-6 h-6" viewBox="0 0 24 24">
                                <path
                                    fill="currentColor"
                                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                    style={{ fill: "#4285F4" }}
                                />
                                <path
                                    fill="currentColor"
                                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                    style={{ fill: "#34A853" }}
                                />
                                <path
                                    fill="currentColor"
                                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                                    style={{ fill: "#FBBC05" }}
                                />
                                <path
                                    fill="currentColor"
                                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                    style={{ fill: "#EA4335" }}
                                />
                            </svg>
                            Sign in with Google
                        </Button>

                        {/* Secret Recovery Phrase Option */}
                        <Button
                            type="button"
                            onClick={handleImportPhrase}
                            className="w-full h-16 rounded-[20px] bg-[#1C1C1C] hover:bg-[#262626] text-[#E0E0E0] font-semibold text-base transition-all active:scale-[0.98]"
                        >
                            Continue with Secret Recovery Phrase
                        </Button>
                    </div>

                    {/* Footer / Terms */}
                    <div className="mt-auto pt-8 text-center text-[12px] text-[#666] leading-relaxed">
                        <p>
                            By continuing you agree to Jumpa's{" "}
                            <a href="#" className="text-[#646CFF] hover:underline font-medium">Terms of use</a>
                            <br />
                            and <a href="#" className="text-[#646CFF] hover:underline font-medium">Privacy notice</a>
                        </p>
                    </div>
                </div>
            </DrawerContent>
        </Drawer>
    );
}