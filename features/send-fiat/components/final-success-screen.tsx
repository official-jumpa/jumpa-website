import React from "react";
import { useNavigate } from "@/lib/pages-adapter";

type FinalSuccessScreenProps = {
  open: boolean;
  amount: string;
  recipientName: string;
  bankName: string;
};

const closeIcon = '/assets/icons/actions/close.svg';

export default function FinalSuccessScreen({
  open,
  amount,
  recipientName,
  bankName,
}: FinalSuccessScreenProps) {
  const navigate = useNavigate();

  if (!open) return null;

  return (
    <div
      className="absolute inset-0 bg-[#171717] z-2000 flex flex-col items-center justify-center"
    >
      <button
        type="button"
        className="absolute top-5 right-5 w-10 h-10 border-none rounded-full bg-[#2d2d2d] flex items-center justify-center cursor-pointer transition-colors duration-150 hover:bg-[#3a3a3a]"
        onClick={() => navigate("/home")}
        aria-label="Close"
      >
        <img
          src={closeIcon}
          alt=""
          width={12}
          height={12}
          className="w-3 h-3 opacity-70"
        />
      </button>
      <img
        src="/assets/images/illustrations/success.png"
        alt="Success badge"
        className="object-contain"
        width={300}
      />

      <h2 className="text-[20px] font-medium text-white mb-2 tracking-wide">
        Successful
      </h2>

      <p className="text-[17px] text-white text-center px-6 leading-6.5">
        Sent ₦ {amount} to {recipientName}
        <br />
        {bankName}
      </p>
    </div>
  );
}
