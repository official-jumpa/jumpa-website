"use client";

import Image from "next/image";
import { useState, useMemo } from "react";
import { signIn } from "@/lib/auth-client";
import { useNavigate } from "@/lib/pages-adapter";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerTitle,
  DrawerTrigger,
  DrawerClose,
} from "@/components/ui/drawer";
import { cn } from "@/lib/utils";

const CLOSE_ICON = "/assets/icons/actions/close.svg";
const GOOGLE_ICON = "/assets/icons/actions/google.svg";

function isValidEmail(value: string) {
  const v = value.trim();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}

/**
 * "Create a new wallet" opens a bottom sheet: email, Continue, Google, or secret phrase.
 */
export default function CreateAccountDrawer() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");

  const emailOk = useMemo(() => isValidEmail(email), [email]);

  const handleEmailContinue = () => {
    if (!emailOk) return;
    try {
      sessionStorage.setItem("onboardingEmail", email.trim());
    } catch {
      /* ignore */
    }
    setOpen(false);
    navigate("/verify-email");
  };

  const handleGoogle = async () => {
    try {
      await signIn.social({
        provider: "google",
        callbackURL: "/setup-pin",
      });
    } catch (error) {
      console.error("[CreateAccountDrawer] Google sign-in failed:", error);
    }
  };

  const handleSecretPhrase = () => {
    setOpen(false);
    navigate("/save-recovery?flow=import", { state: { action: "import" } });
  };

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button className="h-12 w-full rounded-xl bg-white text-base text-black shadow-none transition-colors hover:bg-gray-200">
          Create a new wallet
        </Button>
      </DrawerTrigger>

      <DrawerContent
        overlayClassName="bg-black/40 backdrop-blur-md"
        style={{ fontFamily: "Geist, sans-serif" }}
        className={cn(
          "mx-auto flex h-[430px] w-full max-w-[390px] flex-col overflow-hidden rounded-t-[28px] border-none bg-[#101010] text-white",
          "data-[vaul-drawer-direction=bottom]:max-h-[430px]",
          "[&>div:first-child]:hidden"
        )}
      >
        <DrawerTitle className="sr-only">Create a new wallet</DrawerTitle>

        <div className="relative flex h-full min-h-0 flex-col overflow-hidden px-6 pb-4">
          <div className="pointer-events-none absolute right-[37px] top-[25px]">
            <DrawerClose asChild>
              <button
                type="button"
                aria-label="Close"
                className="pointer-events-auto flex h-[35px] w-[35px] shrink-0 items-center justify-center rounded-[51px] bg-[#2D2D2D] p-[7.95px] transition-colors hover:bg-[#3a3a3a]"
              >
                <Image
                  src={CLOSE_ICON}
                  alt=""
                  width={12}
                  height={12}
                  className="h-3 w-3"
                />
              </button>
            </DrawerClose>
          </div>

          <div className="flex min-h-0 flex-1 w-full max-w-[342px] flex-col self-center pt-[80px]">
            <label className="sr-only" htmlFor="create-wallet-email">
              Email address
            </label>
            <input
              id="create-wallet-email"
              type="email"
              inputMode="email"
              autoComplete="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={cn(
                "h-12 w-full shrink-0 rounded-[10px] border border-[#AAAAAA] bg-transparent px-2.5 pb-[17px] pt-2.5 text-sm leading-[145%] text-white outline-none placeholder:text-[#777777] focus:border-[#AAAAAA] focus:ring-0"
              )}
            />

            <button
              type="button"
              disabled={!emailOk}
              onClick={handleEmailContinue}
              className={cn(
                "mt-2.5 flex h-12 w-full shrink-0 items-center justify-center rounded-[10px] px-2.5 text-base leading-[145%] transition-colors",
                emailOk
                  ? "bg-[#6A59CE] text-[#F4F4F4] hover:bg-[#5c4ec0]"
                  : "cursor-not-allowed bg-[#C3BDEB] text-[#F4F4F4]"
              )}
            >
              Continue
            </button>

            <div
              className="mx-auto my-3 h-px w-full max-w-[307px] shrink-0 bg-[#AAAAAA]"
              aria-hidden
            />

            <div className="flex flex-col gap-2.5">
              <button
                type="button"
                onClick={handleGoogle}
                className="flex h-12 w-full shrink-0 items-center justify-center gap-2 rounded-[10px] bg-white px-2.5 text-base leading-[145%] text-black transition-colors hover:bg-gray-100"
              >
                <Image
                  src={GOOGLE_ICON}
                  alt=""
                  width={16}
                  height={16}
                  className="h-4 w-4 shrink-0"
                />
                Sign in with Google
              </button>

              <button
                type="button"
                onClick={handleSecretPhrase}
                className="flex h-12 w-full shrink-0 items-center justify-center rounded-[10px] bg-[#2D2D2D] px-2.5 text-sm leading-[145%] text-white transition-colors hover:bg-[#3a3a3a]"
              >
                Continue with Secret Phrase
              </button>
            </div>

            <p
              className="mt-auto shrink-0 pt-3 text-center text-xs leading-snug text-white"
              style={{ fontFamily: "Poppins, sans-serif" }}
            >
              By continuing you agree to Jumpa&apos;s{" "}
              <a
                href="/terms"
                className="text-[#6A59CE] underline-offset-2 hover:underline"
              >
                Terms of use
              </a>{" "}
              and{" "}
              <a
                href="/privacy-policy"
                className="text-[#6A59CE] underline-offset-2 hover:underline"
              >
                Privacy notice
              </a>
            </p>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
