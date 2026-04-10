"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useNavigate } from "@/lib/pages-adapter";
import { sendEmailOtp, verifyEmailOtp, generatePhrase } from "@/lib/api";
import { cn } from "@/lib/utils";

const OTP_SUCCESS_ICON = "/assets/icons/IMG_5310%201.svg";

const SESSION_EMAIL_KEY = "onboardingEmail";

function readOnboardingEmail(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const v = sessionStorage.getItem(SESSION_EMAIL_KEY)?.trim();
    return v && v.includes("@") ? v : null;
  } catch {
    return null;
  }
}

/** e.g. user@mail.com → U********@mail.com */
export function maskEmailForDisplay(email: string): string {
  const trimmed = email.trim();
  const at = trimmed.indexOf("@");
  if (at <= 0) return trimmed;
  const local = trimmed.slice(0, at);
  const domain = trimmed.slice(at);
  if (!local.length) return trimmed;
  const first = local[0].toUpperCase();
  return `${first}********${domain}`;
}

type BoxState = "empty" | "filled" | "error" | "success";

export default function VerifyEmailPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState<string | null>(null);
  const [uiPhase, setUiPhase] = useState<"otp" | "success">("otp");
  const [otp, setOtp] = useState("");
  const [boxState, setBoxState] = useState<BoxState>("empty");
  const [sendError, setSendError] = useState<string | null>(null);
  const [verifyError, setVerifyError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(600);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [continueLoading, setContinueLoading] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const sendOnce = useRef(false);

  useEffect(() => {
    const e = readOnboardingEmail();
    if (!e) {
      navigate("/onboarding", { replace: true });
      return;
    }
    setEmail(e);
  }, [navigate]);

  const sendOtp = useCallback(async (addr: string) => {
    setSending(true);
    setSendError(null);
    const res = await sendEmailOtp(addr);
    setSending(false);
    if (res.error || !res.data) {
      setSendError(res.error ?? "Could not send code");
      return false;
    }
    setSecondsLeft(res.data.expiresInSeconds ?? 600);
    setResendCooldown(60);
    return true;
  }, []);

  useEffect(() => {
    if (!email || sendOnce.current) return;
    sendOnce.current = true;
    void sendOtp(email);
  }, [email, sendOtp]);

  useEffect(() => {
    if (uiPhase !== "otp" || secondsLeft <= 0) return;
    const t = window.setInterval(() => {
      setSecondsLeft((s) => Math.max(0, s - 1));
    }, 1000);
    return () => clearInterval(t);
  }, [uiPhase, secondsLeft > 0]);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const t = window.setInterval(() => {
      setResendCooldown((s) => Math.max(0, s - 1));
    }, 1000);
    return () => clearInterval(t);
  }, [resendCooldown > 0]);

  useEffect(() => {
    if (otp.length === 5 && boxState !== "error") {
      setBoxState("filled");
    } else if (otp.length < 5 && boxState === "filled") {
      setBoxState("empty");
    }
  }, [otp.length, boxState]);

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s.toString().padStart(2, "0")}s`;
  };

  const handleOtpChange = (raw: string) => {
    const d = raw.replace(/\D/g, "").slice(0, 5);
    setOtp(d);
    setVerifyError(null);
    if (boxState === "error") setBoxState("empty");
  };

  const handleVerify = async () => {
    if (!email || otp.length !== 5) return;
    setVerifying(true);
    setVerifyError(null);
    const res = await verifyEmailOtp(email, otp);
    setVerifying(false);
    if (res.error || !res.data) {
      setBoxState("error");
      setVerifyError(res.error ?? "Invalid code");
      return;
    }
    setBoxState("success");
    setUiPhase("success");
  };

  const handleContinueSuccess = async () => {
    if (!email) return;
    setContinueLoading(true);
    const res = await generatePhrase();
    if (res.error || !res.data?.phrase) {
      setContinueLoading(false);
      setVerifyError(res.error ?? "Could not create wallet. Try again.");
      setUiPhase("otp");
      setBoxState("empty");
      return;
    }
    setContinueLoading(false);
    navigate("/create-account", {
      state: { phrase: res.data.phrase, action: "create" as const },
    });
  };

  const handleResend = async () => {
    if (!email || resendCooldown > 0 || sending) return;
    const ok = await sendOtp(email);
    if (ok) {
      setOtp("");
      setBoxState("empty");
      setVerifyError(null);
    }
  };

  if (!email) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-black text-[#A1A1AA]">
        Loading…
      </div>
    );
  }

  const masked = maskEmailForDisplay(email);
  const canVerify = otp.length === 5 && !verifying && boxState !== "success";
  const showTimer = otp.length > 0 && secondsLeft > 0 && boxState !== "error";

  if (uiPhase === "success") {
    return (
      <div
        className="flex min-h-dvh w-full flex-col bg-black px-6 text-white"
        style={{ fontFamily: "Geist, sans-serif" }}
      >
        <div className="mx-auto flex w-full max-w-[343px] flex-1 flex-col items-center pt-16">
          <div className="relative mb-6 w-full max-w-[303px] px-5">
            <Image
              src={OTP_SUCCESS_ICON}
              alt=""
              width={303}
              height={303}
              unoptimized
              className="mx-auto h-auto w-full max-w-[303px] object-contain"
              priority
            />
          </div>
          <p
            className="text-center text-2xl leading-[145%] tracking-[-0.02em] text-white"
            style={{ fontFamily: "Geist, sans-serif", fontWeight: 400 }}
          >
            Successful
          </p>
          <div className="mt-14 w-full">
            <button
              type="button"
              disabled={continueLoading}
              onClick={handleContinueSuccess}
              className={cn(
                "flex h-12 w-full items-center justify-center rounded-xl text-base leading-6 text-white transition-opacity",
                continueLoading ? "cursor-wait opacity-70" : "opacity-100",
              )}
              style={{
                fontFamily: "Poppins, sans-serif",
                fontWeight: 400,
                background: "#6A59CE",
              }}
            >
              {continueLoading ? "Please wait…" : "Continue"}
            </button>
          </div>
        </div>
        {verifyError ? (
          <p className="mx-auto mb-6 max-w-[343px] text-center text-sm text-red-400">
            {verifyError}
          </p>
        ) : null}
      </div>
    );
  }

  const boxVisual = (i: number) => {
    const ch = otp[i] ?? "";
    if (boxState === "error") {
      return {
        bg: "#FFE9E9",
        border: "#FF2524",
        text: "#5A5A5A",
      };
    }
    if (boxState === "success") {
      return {
        bg: "#E6F6E9",
        border: "#25AD3E",
        text: "#5A5A5A",
      };
    }
    if (ch) {
      return {
        bg: "#F0EEFA",
        border: "#C3BDEB",
        text: "#5A5A5A",
      };
    }
    return {
      bg: "#2D2D2D",
      border: "#101010",
      text: "#5A5A5A",
    };
  };

  return (
    <div
      className="flex min-h-dvh w-full flex-col items-center justify-center bg-black px-6 text-white"
      style={{ fontFamily: "Geist, sans-serif" }}
    >
      <div className="mx-auto flex w-full max-w-[343px] flex-col gap-20">
        <div className="flex flex-col gap-2 text-center">
          <h1
            className="text-[20px] font-bold leading-[30px] text-white"
            style={{ fontFamily: "Geist, sans-serif" }}
          >
            Verify email address
          </h1>
          <p
            className="text-sm leading-5 text-[#D5D5D5]"
            style={{ fontFamily: "Poppins, sans-serif", fontWeight: 400 }}
          >
            Verify your email address below to continue.
          </p>
        </div>

        <div className="flex flex-col items-center gap-6">
          <p
            className="max-w-[351px] text-center text-sm leading-5 text-[#777777]"
            style={{ fontFamily: "Poppins, sans-serif", fontWeight: 400 }}
          >
            Enter the{" "}
            <span
              className="text-sm font-medium text-white"
              style={{ fontFamily: "Geist, sans-serif", fontWeight: 500 }}
            >
              5 digit code
            </span>{" "}
            sent to your email address{" "}
            <span
              className="text-sm font-medium text-white"
              style={{ fontFamily: "Geist, sans-serif", fontWeight: 500 }}
            >
              {masked}
            </span>
          </p>

          <input
            ref={inputRef}
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={5}
            value={otp}
            onChange={(e) => handleOtpChange(e.target.value)}
            className="sr-only"
            aria-label="Verification code"
          />

          <div
            className="flex flex-row justify-center gap-3"
            style={{ width: 298 }}
            role="group"
            aria-label="OTP digits"
          >
            {[0, 1, 2, 3, 4].map((i) => {
              const v = boxVisual(i);
              const digit = otp[i] ?? "";
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => inputRef.current?.focus()}
                  className="flex h-[50px] w-[50px] items-center justify-center rounded-lg border p-2.5 text-lg font-medium leading-[145%] outline-none transition-colors"
                  style={{
                    backgroundColor: v.bg,
                    borderColor: v.border,
                    borderWidth: 1,
                    color: digit ? v.text : "transparent",
                    fontFamily: "Geist, sans-serif",
                    fontWeight: 500,
                  }}
                >
                  {digit || "\u00a0"}
                </button>
              );
            })}
          </div>

          {showTimer ? (
            <p
              className="text-center text-sm text-[#777777]"
              style={{ fontFamily: "Poppins, sans-serif" }}
            >
              Code expires in{" "}
              <span className="font-medium text-white">{formatTime(secondsLeft)}</span>
            </p>
          ) : null}

          {sendError ? (
            <p className="text-center text-sm text-red-400" role="alert">
              {sendError}
            </p>
          ) : null}
          {verifyError ? (
            <p className="text-center text-sm text-red-400" role="alert">
              {verifyError}
            </p>
          ) : null}

          <div
            className="mt-1 flex flex-row items-center justify-center gap-1"
            style={{ width: 230 }}
          >
            <span
              className="text-base leading-6 text-[#777777]"
              style={{ fontFamily: "Poppins, sans-serif", fontWeight: 400 }}
            >
              Didn&apos;t get code
            </span>
            <button
              type="button"
              disabled={resendCooldown > 0 || sending}
              onClick={handleResend}
              className={cn(
                "text-base font-bold leading-6 text-[#6A59CE] disabled:opacity-40",
              )}
              style={{ fontFamily: "Geist, sans-serif" }}
            >
              {resendCooldown > 0 ? `Resend (${resendCooldown}s)` : "Resend Code"}
            </button>
          </div>
        </div>

        <button
          type="button"
          disabled={!canVerify}
          onClick={handleVerify}
          className={cn(
            "flex h-12 w-full items-center justify-center rounded-xl text-base leading-6 transition-colors",
            canVerify
              ? "bg-[#6A59CE] text-white"
              : "cursor-not-allowed bg-[#C3BDEB] text-white",
          )}
          style={{ fontFamily: "Poppins, sans-serif", fontWeight: 400 }}
        >
          {verifying ? "Verifying…" : "Verify Email"}
        </button>
      </div>
    </div>
  );
}
