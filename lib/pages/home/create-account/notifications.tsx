"use client"
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";

export default function Notifications() {
    const router = useRouter();

    const handleAction = () => {
        // Both enabling and skipping lead to the home screen
        router.push("/home");
    };

    return (
        <div className="fixed inset-0 w-full h-dvh bg-black text-white flex flex-col px-6 py-12">
            
            {/* --- MAIN CONTENT (Vertically Centered) --- */}
            <div className="flex-1 flex flex-col items-center justify-center w-full max-w-md mx-auto text-center -mt-12">
                <img src="/notifications.svg" alt="" />
                <h1 className="text-3xl font-bold tracking-tight mb-4">
                    Enable notifications
                </h1>
                <p className="text-[#A1A1AA] text-[15px] leading-relaxed px-2 sm:px-4">
                    Get personalized notifications for transactions, account changes, and security alerts.
                </p>
            </div>

            {/* --- BOTTOM BUTTONS --- */}
            <div className="mt-auto pb-6 w-full max-w-md mx-auto flex flex-col gap-4">
                <Button 
                    onClick={handleAction}
                    className="w-full h-14 rounded-xl bg-[#8B5CF6] hover:bg-[#7C3AED] text-white font-semibold text-base transition-colors shadow-none"
                >
                    Enable notification
                </Button>

                <Button 
                    onClick={handleAction}
                    variant="outline"
                    className="w-full h-14 rounded-xl bg-transparent hover:bg-[#1C1C1E] border border-[#333333] text-white hover:text-white font-semibold text-base transition-colors shadow-none"
                >
                    Skip for now
                </Button>
            </div>
            
        </div>
    );
}