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

    return (
        <Drawer open={isOpen} onOpenChange={setIsOpen}>
            <DrawerTrigger asChild>
                <Button className="w-full h-14 rounded-xl bg-[#3F443F] hover:bg-[#323632] text-white font-medium text-base shadow-none">
                    I have an existing wallet
                </Button>
            </DrawerTrigger>

            <DrawerContent
                style={{ fontFamily: "Geist" }}
                className="bg-[#121212] border-t border-[#262626] text-white px-6 pb-8 pt-4 rounded-t-3xl"
            >
                <div className="mx-auto w-full max-w-md">

                    {/* Close Button */}
                    <div className="flex justify-end mb-6">
                        <DrawerClose asChild>
                            <button className="w-8 h-8 rounded-full bg-[#262626] flex items-center justify-center hover:bg-[#333333] transition-colors">
                                <X className="w-4 h-4 text-gray-400" />
                            </button>
                        </DrawerClose>
                    </div>

                    {/* Hidden title for screen reader accessibility */}
                    <DrawerTitle className="sr-only">Import Wallet</DrawerTitle>

                    <h2 className="text-xl font-bold mb-2">Import your wallet</h2>
                    <p className="text-[#A1A1AA] text-sm mb-6">
                        Restore access to your existing wallet using your Secret Recovery Phrase.
                    </p>

                    <div className="space-y-3">
                        <Button
                            type="button"
                            onClick={handleImportPhrase}
                            className="w-full h-14 rounded-xl bg-[#8B5CF6] hover:bg-[#7C3AED] text-white font-semibold text-base"
                        >
                            Import using Secret Recovery Phrase
                        </Button>
                    </div>

                    {/* Footer */}
                    <div className="mt-8 text-center text-xs text-[#A1A1AA]">
                        <p>By continuing you agree to Jumpa's{" "}
                            <a href="#" className="text-[#8B5CF6] hover:underline">Terms of use</a>
                            {" "}and{" "}
                            <a href="#" className="text-[#8B5CF6] hover:underline">Privacy notice</a>
                        </p>
                    </div>
                </div>
            </DrawerContent>
        </Drawer>
    );
}