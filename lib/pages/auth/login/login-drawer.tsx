import { useNavigate } from "@/lib/pages-adapter";
import { Button } from "@/components/ui/button";

/**
 * "I have an existing wallet" — same path as "Continue with Secret Phrase" in the
 * create-wallet sheet: `/save-recovery?flow=import` with import action in nav state.
 */
export default function LoginDrawer() {
    const navigate = useNavigate();

    const handleExistingWallet = () => {
        navigate("/save-recovery?flow=import", { state: { action: "import" } });
    };

    return (
        <Button
            type="button"
            onClick={handleExistingWallet}
            className="h-14 w-full rounded-xl bg-[#3F443F] text-base font-medium text-white shadow-none transition-all hover:bg-[#323632] active:scale-[0.98]"
        >
            I have an existing wallet
        </Button>
    );
}
