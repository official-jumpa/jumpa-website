import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ImportPrivateKey() {
  const router = useRouter();
  const [key, setKey] = useState("");

  const handleImport = () => {
    // Navigates to the notifications screen as requested
    router.push("/create-account");
  };

  return (
    <div className="fixed inset-0 w-full h-dvh bg-black text-white flex flex-col px-6 py-12">
      <div className="w-full max-w-md mx-auto flex flex-col flex-1">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="w-10 h-10 rounded-full bg-[#1C1C1E] flex items-center justify-center hover:bg-[#2C2C2E] transition-colors mb-8"
        >
          <ArrowLeft className="w-5 h-5 text-gray-400" />
        </button>

        {/* Header Text */}
        <h1 className="text-3xl font-bold tracking-tight mb-3">
          Enter a Private Key
        </h1>
        <p className="text-[#A1A1AA] text-[15px] mb-8">
          Use spaces between words if using a recovery phrase
        </p>

        {/* Text Area Input */}
        {/* Using a standard textarea styled like Shadcn to support multi-line phrases */}
        <textarea
          value={key}
          onChange={(e) => setKey(e.target.value)}
          placeholder="Recovery or private key"
          className="w-full min-h-30 bg-transparent border border-[#333333] rounded-xl p-4 text-white placeholder:text-[#52525B] focus:outline-none focus:ring-1 focus:ring-[#8B5CF6] focus:border-[#8B5CF6] resize-none transition-colors"
        />
      </div>

      {/* Bottom Button */}
      <div className="mt-auto pb-6 w-full max-w-md mx-auto">
        <Button
          onClick={handleImport}
          disabled={!key.trim()} // Disabled until they type something
          className={`w-full h-14 rounded-xl text-white font-semibold text-base transition-colors shadow-none ${
            key.trim()
              ? "bg-[#8B5CF6] hover:bg-[#7C3AED]" // Active Solid Purple
              : "bg-[#A78BFA]/60 text-white/80 cursor-not-allowed" // Inactive Faded Purple matching design
          }`}
        >
          Import
        </Button>
      </div>
    </div>
  );
}
