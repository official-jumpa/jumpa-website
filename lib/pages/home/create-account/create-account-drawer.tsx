import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";

/**
 * "Create a new wallet" entry point on the onboarding screen.
 * Navigates directly to /save-recovery where the user will see
 * a real seed phrase fetched from the backend.
 */
export default function CreateAccountDrawer() {
    const router = useRouter();

    const handleCreate = () => {
        console.log("[CreateAccountDrawer] Navigating to /save-recovery (create flow)");
        router.push("/save-recovery");
    };

    return (
        <Button
            onClick={handleCreate}
            className="w-full h-12 rounded-xl bg-white hover:bg-gray-200 text-black text-base shadow-none transition-colors"
        >
            Create a new wallet
        </Button>
    );
}