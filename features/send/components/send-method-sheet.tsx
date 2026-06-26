import React, { useState } from "react";
import { useRouter } from "next/navigation";

const closeIcon = "/assets/icons/actions/close.svg";
const backIcon = "/assets/icons/actions/back.svg";
const sendCircleIcon = "/assets/icons/actions/send-circle.svg";
const sideIcon = "/assets/icons/navigation/side.svg";

type SendMethodSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export default function SendMethodSheet({
  open,
  onOpenChange,
}: SendMethodSheetProps) {
  const router = useRouter();
  const [step, setStep] = useState<"methods" | "fiat">("methods");

  if (!open) return null;

  if (step === "fiat") {
    return (
      <div
        className="deposit-method-sheet deposit-method-sheet-default"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
      >
        <div className="absolute top-3.5 left-[23px] w-[298px] max-w-[calc(100%-46px)] h-[35px] flex items-center justify-between z-10">
          <button
            type="button"
            className="w-[35px] h-[35px] p-2 border-none rounded-[51.1px] bg-[#2d2d2d] flex items-center justify-center cursor-pointer shrink-0 transition-colors duration-150 ease-out hover:bg-[#3a3a3a]"
            onClick={() => setStep("methods")}
            aria-label="Back"
          >
            <img src={backIcon} alt="" className="w-3.5 h-[11px] block" />
          </button>
          <button
            type="button"
            className="w-[35px] h-[35px] p-2 border-none rounded-[51.1px] bg-[#2d2d2d] flex items-center justify-center cursor-pointer shrink-0 transition-colors duration-150 ease-out hover:bg-[#3a3a3a]"
            onClick={() => onOpenChange(false)}
            aria-label="Close"
          >
            <img src={closeIcon} alt="" className="w-[11.72px] h-[11.72px] block opacity-70" />
          </button>
        </div>

        <div className="flex flex-col items-center w-full pt-14 px-4 pb-5 box-border flex-1 min-h-0">
          <div className="w-[300px] max-w-full min-h-[57px] mt-2.5 flex flex-col items-center gap-1.5 text-center mb-6">
            <h2 className="m-0 font-sans font-bold text-xl leading-[120%] tracking-[-0.02em] text-white">
              Send Fiat
            </h2>
            <p className="m-0 max-w-[286px] font-sans font-normal text-xs leading-[145%] tracking-[-0.02em] text-[#959595]/60">
              Choose a method below to send funds from your account
            </p>
          </div>

          <div className="w-[310px] max-w-full mt-auto flex flex-col gap-3 pb-1">
            <button
              type="button"
              className="w-full h-[66px] box-border border-none rounded-2xl bg-[#2d2d2d] cursor-pointer text-left py-3.5 px-[19px] flex items-center transition-all duration-150 ease-out hover:bg-[#353535] active:opacity-[0.92]"
              onClick={() => {
                onOpenChange(false);
                router.push("/send/fiat");
              }}
            >
              <div className="w-full max-w-[272px] mx-auto flex items-center justify-between gap-3">
                <div className="flex flex-col gap-0.5 min-w-0">
                  <span className="font-sans text-sm leading-[145%] tracking-[-0.02em] text-[#f4f4f4] font-medium">
                    Local bank transfer
                  </span>
                  <span className="font-sans font-normal text-xs leading-[145%] tracking-[-0.02em] text-[#5a5a5a]">
                    Send directly to any local bank.
                  </span>
                </div>
                <img src={sideIcon} alt="" className="w-[5px] h-2 shrink-0 object-contain brightness-0 invert opacity-90" />
              </div>
            </button>

            <button
              type="button"
              className="w-full h-[66px] box-border border-none rounded-2xl bg-[#2d2d2d] cursor-not-allowed text-left py-3.5 px-[19px] flex items-center opacity-50"
            >
              <div className="w-full max-w-[272px] mx-auto flex items-center justify-between gap-3">
                <div className="flex flex-col gap-0.5 min-w-0">
                  <span className="font-sans text-sm leading-[145%] tracking-[-0.02em] text-[#f4f4f4] font-semibold">
                    Cross border bank
                  </span>
                  <span className="font-sans font-normal text-xs leading-[145%] tracking-[-0.02em] text-[#5a5a5a]">
                    Send across border directly to their account.
                  </span>
                </div>
                <img src={sideIcon} alt="" className="w-[5px] h-2 shrink-0 object-contain brightness-0 invert opacity-90" />
              </div>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="deposit-method-sheet deposit-method-sheet-default"
      onClick={(e) => e.stopPropagation()}
      role="dialog"
      aria-labelledby="send-sheet-title"
      aria-modal="true"
    >
      <button
        type="button"
        className="absolute top-3.5 right-[21px] w-[35px] h-[35px] p-2 border-none rounded-[50.91px] bg-[#2d2d2d] flex items-center justify-center cursor-pointer gap-2 z-10 transition-colors duration-150 ease-out hover:bg-[#3a3a3a]"
        onClick={() => onOpenChange(false)}
        aria-label="Close"
      >
        <img src={closeIcon} alt="" width={12} height={12} className="w-[11.72px] h-[11.72px] block opacity-70" />
      </button>

      <div className="flex flex-col items-center w-full pt-14 px-4 pb-5 box-border flex-1 min-h-0">
        <img
          src={sendCircleIcon}
          alt=""
          className="w-20 h-20 shrink-0 block object-contain"
          width={80}
          height={80}
        />

        <div className="w-[300px] max-w-full min-h-[57px] mt-2.5 flex flex-col items-center gap-1.5 text-center">
          <h2 id="send-sheet-title" className="m-0 font-sans font-bold text-xl leading-[120%] tracking-[-0.02em] text-white">
            Send
          </h2>
          <p className="m-0 max-w-[286px] font-sans font-normal text-xs leading-[145%] tracking-[-0.02em] text-[#959595]/60">
            Choose a method below to send funds from your account
          </p>
        </div>

        <div className="w-[310px] max-w-full mt-auto flex flex-col gap-3 pb-1">
          <button
            type="button"
            className="w-full h-[66px] box-border border-none rounded-2xl bg-[#2d2d2d] cursor-pointer text-left py-3.5 px-[19px] flex items-center transition-all duration-150 ease-out hover:bg-[#353535] active:opacity-[0.92]"
            onClick={() => setStep("fiat")}
          >
            <div className="w-full max-w-[272px] mx-auto flex items-center justify-between gap-3">
              <div className="flex flex-col gap-0.5 min-w-0">
                <span className="font-sans text-sm leading-[145%] tracking-[-0.02em] text-[#f4f4f4] font-medium">
                  Send Fiat
                </span>
                <span className="font-sans font-normal text-xs leading-[145%] tracking-[-0.02em] text-[#5a5a5a]">
                  Send to directly to banks
                </span>
              </div>
              <img src={sideIcon} alt="" className="w-[5px] h-2 shrink-0 object-contain brightness-0 invert opacity-90" />
            </div>
          </button>

          <button
            type="button"
            className="w-full h-[66px] box-border border-none rounded-2xl bg-[#2d2d2d] cursor-pointer text-left py-3.5 px-[19px] flex items-center transition-all duration-150 ease-out hover:bg-[#353535] active:opacity-[0.92]"
            onClick={() => {
              onOpenChange(false);
              router.push("/send");
            }}
          >
            <div className="w-full max-w-[272px] mx-auto flex items-center justify-between gap-3">
              <div className="flex flex-col gap-0.5 min-w-0">
                <span className="font-sans text-sm leading-[145%] tracking-[-0.02em] text-[#f4f4f4] font-semibold">
                  Crypto
                </span>
                <span className="font-sans font-normal text-xs leading-[145%] tracking-[-0.02em] text-[#5a5a5a]">
                  Send to crypto wallets.
                </span>
              </div>
              <img src={sideIcon} alt="" className="w-[5px] h-2 shrink-0 object-contain brightness-0 invert opacity-90" />
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
