import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";

export default function LoginSuccess() {
    const router = useRouter();

    const handleUnlockWallet = () => {
        // Navigate to the Keypad/PIN screen we built previously
        router.push("/login");
    };

    return (
        <div className="fixed inset-0 w-full h-dvh bg-black flex flex-col items-center justify-between pb-10 px-6">
            
            {/* Center Content */}
            <div className="flex-1 flex items-center justify-center">
                <h1 className="text-white text-3xl font-bold tracking-tight">
                    You're logged in!
                </h1>
            </div>

            {/* Bottom Button */}
            <div className="w-full max-w-md pb-6">
                <Button
                    onClick={handleUnlockWallet}
                    className="w-full h-14 rounded-xl bg-white hover:bg-gray-200 text-black font-semibold text-base shadow-none transition-colors"
                >
                    Unlock wallet
                </Button>
            </div>
            
        </div>
    );
}