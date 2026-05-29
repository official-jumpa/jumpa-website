"use client"
import { Button } from "@/components/ui/button"; // Assuming Shadcn Button
import { useRouter } from 'next/navigation';

export default function ImportOptions() {
    const router = useRouter();

    return (
        <div className="fixed inset-0 w-full h-dvh bg-black flex flex-col justify-center items-center pb-10 px-6 ">
            {/* Logo positioned just above the buttons */}
            <div className="flex items-center justify-center mb-12">
                <img
                    src="/large-logo.svg"
                    alt="Jumpa Logo"
                    className="w-full h-full object-contain "
                />
            </div>

            {/* Bottom Buttons */}
            <div className="w-full flex flex-col gap-3 max-w-md pb-6">
                <Button onClick={() => router.push("/save-recovery?flow=import")} className="w-full h-12 rounded-xl bg-white hover:bg-gray-200 text-black text-base shadow-none transition-colors">
                    Import using Secret Recovery Phrase
                </Button>


            </div>
        </div>
    );
}