import { useState } from "react";
import { ArrowLeft, Clock, Search, X, Delete } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

// Mock Data
const MOCK_BENEFICIARIES = [
  { id: 1, name: "0904 567 6784", network: "Airtel", type: "new" },
  { id: 2, name: "me", phone: "0912 678 4565", network: "MTN", type: "saved" },
  { id: 3, name: "0945 879 098", network: "Glo", type: "saved" },
  { id: 4, name: "080 456 678", network: "MTN", type: "saved" },
];

const QUICK_AMOUNTS = [
  { amount: 100, pay: 98 },
  { amount: 200, pay: 196 },
  { amount: 300, pay: 294 },
  { amount: 1000, pay: 980 },
  { amount: 2000, pay: 1960 },
  { amount: 5000, pay: 4900 },
];

export default function AirtimeFlow() {
  // Flow State
  const [step, setStep] = useState<1 | 2 | 3>(1); // 1: Number, 2: Amount, 3: Success
  const [phone, setPhone] = useState("");
  const [search, setSearch] = useState("");
  const [amount, setAmount] = useState("");
  const [network, setNetwork] = useState<"MTN" | "Airtel" | "Glo">("MTN");
  const router = useRouter();

  // Modal States
  const [isNetworkModalOpen, setIsNetworkModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

  // Computed
  const filteredBeneficiaries = MOCK_BENEFICIARIES.filter(
    (b) =>
      b.name.toLowerCase().includes(search.toLowerCase()) ||
      (b.phone && b.phone.includes(search)),
  );

  const discountAmount = amount ? Math.max(0, parseInt(amount) - 2) : 0; // Simple flat -2 logic

  // Handlers
  const handleKeypadPress = (val: string) => {
    if (val === "delete") {
      setAmount((prev) => prev.slice(0, -1));
    } else {
      setAmount((prev) => prev + val);
    }
  };

  const handlePay = () => {
    setIsConfirmModalOpen(false);
    setStep(3);
  };

  // --- RENDERS ---

  return (
    // Replaced h-dvh with min-h-[100dvh] and removed static pb-10 to prevent bottom cutoffs
    <div className="fixed inset-0 w-full h-dvh bg-[#050505] text-white flex justify-center pb-6 sm:pb-10">
      <div className="w-full max-w-md bg-[#050505] flex flex-col relative overflow-hidden h-full mt-2 sm:mt-5">
        {/* --- STEP 1: SELECT PHONE & BENEFICIARY --- */}
        {step === 1 && (
          <div className="flex flex-col h-full px-4 sm:px-5 py-4 sm:py-6 overflow-y-auto custom-scrollbar">
            {/* Header */}
            <div className="flex items-center justify-between mb-4 sm:mb-6 shrink-0">
              <button
                onClick={() => router.back()}
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#1C1C1E] flex items-center justify-center hover:bg-[#2C2C2E] transition"
              >
                <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 text-gray-300" />
              </button>
              <h1 className="text-[17px] sm:text-lg font-semibold">Airtime</h1>
              <button className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#1C1C1E] flex items-center justify-center hover:bg-[#2C2C2E] transition">
                <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-gray-300" />
              </button>
            </div>

            {/* Promo Banner */}
            <div
              className="w-full h-16 sm:h-20 rounded-2xl p-3 sm:p-4 mb-4 sm:mb-6 shrink-0 relative overflow-hidden bg-cover bg-center bg-no-repeat"
              style={{ backgroundImage: "url('/airtime_bg.svg')" }}
            >
              <div className="relative z-10 w-3/4 sm:w-2/3 h-full flex items-center">
                <p className="text-white font-semibold text-[13px] sm:text-sm leading-tight">
                  Enjoy 2 Naira discount on all recharge
                </p>
              </div>
            </div>

            {/* Phone Input */}
            <div className="mb-4 sm:mb-6 shrink-0">
              <label className="text-[13px] sm:text-sm text-gray-400 mb-2 block">
                Enter phone number
              </label>
              <div className="relative flex items-center">
                <input
                  type="text"
                  placeholder="0901 000 0000"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-[#1C1C1E] border border-white/5 rounded-2xl h-12 sm:h-14 pl-4 pr-14 text-[14px] sm:text-[15px] text-white placeholder-gray-400 focus:outline-none focus:border-[#8B5CF6] transition-colors"
                />
                <button className="absolute right-2 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[#2C2C2E] flex items-center justify-center text-[#8B5CF6]">
                  <img
                    src="/phone.svg"
                    alt=""
                    className="w-4 h-4 sm:w-5 sm:h-5"
                  />
                </button>
              </div>

              {/* Network Selector Chip */}
              {phone.length > 3 && (
                <div
                  onClick={() => setIsNetworkModalOpen(true)}
                  className="mt-3 inline-flex items-center gap-2 bg-[#1C1C1E] border border-white/10 rounded-full px-3 py-1.5 cursor-pointer hover:bg-[#2C2C2E]"
                >
                  <img
                    src={
                      network === "MTN"
                        ? "/mtn.svg"
                        : network === "Airtel"
                          ? "/airtel.svg"
                          : "/glo.svg"
                    }
                    alt={`${network} logo`}
                    className="w-4 h-4 sm:w-5 sm:h-5 rounded-full object-cover bg-white"
                  />
                  <span className="text-[11px] sm:text-xs font-semibold">
                    {network}
                  </span>
                </div>
              )}
            </div>

            {/* Beneficiaries List */}
            <div className="flex-1 flex flex-col min-h-0">
              <label className="text-[13px] sm:text-sm text-gray-400 mb-2 sm:mb-3 block shrink-0">
                Select beneficiary
              </label>

              <div className="relative mb-3 sm:mb-4 shrink-0">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type="text"
                  placeholder="Search here"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-[#1C1C1E] border border-white/5 rounded-2xl h-11 sm:h-12 pl-10 pr-4 text-[13px] sm:text-sm text-white placeholder-gray-400 focus:outline-none focus:border-[#8B5CF6]"
                />
              </div>

              <div className="bg-[#1C1C1E] border border-white/5 rounded-3xl p-2 flex-1 overflow-y-auto custom-scrollbar">
                {filteredBeneficiaries.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-32 sm:h-40 text-gray-500">
                    <div className="flex -space-x-3 mb-2 sm:mb-3">
                      <img
                        src="/group_airtime.svg"
                        className="w-12 h-12 sm:w-auto sm:h-auto"
                        alt=""
                      />
                    </div>
                    <span className="text-[13px] sm:text-sm">
                      No beneficiary
                    </span>
                  </div>
                ) : (
                  <div className="space-y-1">
                    {filteredBeneficiaries.map((b) => (
                      <div
                        key={b.id}
                        onClick={() => {
                          setPhone(b.phone || b.name);
                          setStep(2);
                        }}
                        className="flex items-center justify-between p-2.5 sm:p-3 rounded-2xl hover:bg-[#2C2C2E] cursor-pointer transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 sm:w-10 sm:h-10 shrink-0 rounded-full bg-gray-800 overflow-hidden flex items-center justify-center border border-white/10">
                            {b.type === "saved" ? (
                              <img src="/avatar_1.svg" alt="" />
                            ) : (
                              <img src="/avatar_2.svg" alt="" />
                            )}
                          </div>
                          <div className="flex flex-col overflow-hidden">
                            <span className="text-[13px] sm:text-sm font-semibold truncate">
                              {b.name}
                            </span>
                            <span className="text-[11px] sm:text-xs text-gray-500 truncate">
                              {b.network} {b.phone && `• ${b.phone}`}
                            </span>
                          </div>
                        </div>
                        <div className="w-4 h-4 sm:w-5 sm:h-5 shrink-0 rounded-full border border-gray-600 ml-2"></div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Floating Continue button when phone is typed */}
            {phone.length >= 10 && (
              <div className="mt-4 shrink-0">
                <Button
                  onClick={() => setStep(2)}
                  className="w-full h-12 sm:h-14 rounded-2xl bg-[#8B5CF6] hover:bg-[#7C3AED] text-white font-semibold text-[15px] sm:text-base shadow-none"
                >
                  Continue
                </Button>
              </div>
            )}
          </div>
        )}

        {/* --- STEP 2: ADD AMOUNT --- */}
        {step === 2 && (
          <div className="flex flex-col h-full px-4 sm:px-5 py-4 sm:py-6 relative overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between mb-4 sm:mb-8 shrink-0">
              <button
                onClick={() => setStep(1)}
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#1C1C1E] flex items-center justify-center hover:bg-[#2C2C2E] transition"
              >
                <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 text-gray-300" />
              </button>
              <h1 className="text-[17px] sm:text-lg font-semibold flex-1 text-center pr-9 sm:pr-10">
                Add amount
              </h1>
            </div>

            {/* Selected Network Info */}
            <div className="flex items-center justify-center gap-2 mb-4 sm:mb-8 text-[13px] sm:text-sm shrink-0">
              <img
                src={`/${network.toLowerCase()}.svg`}
                alt={`${network} logo`}
                className="w-4 h-4 sm:w-5 sm:h-5 rounded-full object-cover bg-white"
              />
              <span className="text-blue-500 font-semibold">{network}</span>
              <span className="text-gray-400">{phone}</span>
            </div>

            {/* Big Amount Input Display */}
            <div className="text-center mb-4 sm:mb-8 shrink-0">
              <h1
                className={`text-4xl sm:text-5xl font-bold tracking-tight mb-1 sm:mb-2 truncate px-2 ${amount ? "text-white" : "text-gray-600"}`}
              >
                ₦ {amount || "0"}
              </h1>
              <p className="text-gray-500 text-[11px] sm:text-xs">
                Allowed limit: ₦100 - ₦ 500,000
              </p>
            </div>

            {/* Quick Amounts Grid - Scaled for mobile */}
            <div className="grid grid-cols-3 gap-y-4 gap-x-2 sm:gap-y-5 sm:gap-x-3 mb-auto pt-2 shrink-0">
              {QUICK_AMOUNTS.map((q) => {
                const saveAmount = q.amount - q.pay;
                return (
                  <div
                    key={q.amount}
                    onClick={() => setAmount(q.amount.toString())}
                    className={`relative bg-[#1C1C1E] rounded-xl sm:rounded-2xl p-2 sm:p-3 pt-4 sm:pt-5 flex flex-col items-center justify-center cursor-pointer border transition-colors ${
                      amount === q.amount.toString()
                        ? "border-[#8B5CF6] bg-[#8B5CF6]/10"
                        : "border-transparent hover:bg-[#2C2C2E]"
                    }`}
                  >
                    <div className="absolute -top-2.5 sm:-top-3 left-1/2 -translate-x-1/2 sm:left-3 sm:translate-x-0 bg-[#EAE5FF] text-[#5B3EE4] text-[9px] sm:text-[11px] font-bold px-2 py-0.5 rounded-full shadow-sm whitespace-nowrap">
                      Save ₦ {saveAmount}
                    </div>
                    <span className="font-bold text-lg sm:text-2xl text-white mb-0.5 sm:mb-1 truncate w-full text-center">
                      ₦ {q.amount}
                    </span>
                    <span className="text-[11px] sm:text-[13px] text-gray-500 font-medium tracking-wide truncate w-full text-center">
                      Pay ₦ {q.pay}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Continue Button & Custom Keypad */}
            <div className="mt-4 sm:mt-auto shrink-0 flex flex-col justify-end">
              <Button
                onClick={() => setIsConfirmModalOpen(true)}
                disabled={!amount}
                className={`w-full h-12 sm:h-14 rounded-2xl font-semibold text-[15px] sm:text-base shadow-none mb-4 sm:mb-6 shrink-0 ${
                  amount
                    ? "bg-[#8B5CF6] hover:bg-[#7C3AED] text-white"
                    : "bg-[#2C2C2E] text-gray-500"
                }`}
              >
                Continue
              </Button>

              {/* Custom Numeric Keypad - Adjusted height for small screens */}
              <div className="bg-[#1C1C1E] -mx-4 sm:-mx-5 -mb-4 sm:-mb-6 p-4 sm:p-5 pt-3 sm:pt-4 rounded-t-3xl border-t border-white/5">
                <div className="flex justify-between items-center mb-3 sm:mb-4 px-2">
                  <span className="text-[11px] sm:text-xs text-gray-500">
                    Jumpa Secure Numeric Keypad
                  </span>
                  <button className="text-[#8B5CF6] text-[11px] sm:text-xs font-semibold">
                    Done
                  </button>
                </div>
                <div className="grid grid-cols-3 gap-x-2 gap-y-2 sm:gap-y-3">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                    <button
                      key={num}
                      onClick={() => handleKeypadPress(num.toString())}
                      className="h-10 sm:h-12 bg-[#2C2C2E] rounded-xl text-lg sm:text-xl font-medium active:bg-[#3C3C3E] transition-colors"
                    >
                      {num}
                    </button>
                  ))}
                  <div className="h-10 sm:h-12"></div>
                  <button
                    onClick={() => handleKeypadPress("0")}
                    className="h-10 sm:h-12 bg-[#2C2C2E] rounded-xl text-lg sm:text-xl font-medium active:bg-[#3C3C3E] transition-colors"
                  >
                    0
                  </button>
                  <button
                    onClick={() => handleKeypadPress("delete")}
                    className="h-10 sm:h-12 bg-[#2C2C2E] rounded-xl flex items-center justify-center active:bg-[#3C3C3E] transition-colors"
                  >
                    <Delete className="w-5 h-5 sm:w-6 sm:h-6" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* --- STEP 3: SUCCESS --- */}
        {step === 3 && (
          <div className="flex flex-col items-center justify-center h-full px-5 py-6 relative">
            <button
              onClick={() => router.push("/home")}
              className="absolute top-4 sm:top-6 left-4 sm:left-5 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#1C1C1E] flex items-center justify-center hover:bg-[#2C2C2E] transition"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5 text-gray-300" />
            </button>

            <div className="flex flex-col items-center text-center">
              <img
                src="/airtime_success.svg"
                alt="Success"
                className="max-w-45 sm:max-w-55 mb-4"
              />
              <h2 className="text-3xl sm:text-4xl mb-1 sm:mb-2 font-bold">
                Successful
              </h2>
              <h3 className="text-gray-400 text-xl sm:text-2xl font-medium">
                ₦ {amount}.00
              </h3>
            </div>
          </div>
        )}

        {/* --- MODALS --- */}

        {/* Change Network Modal */}
        {isNetworkModalOpen && (
          <div className="absolute inset-0 z-50 flex items-center justify-center px-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            {/* Removed mt-130 to ensure it perfectly centers on all screen sizes */}
            <div className="bg-[#111111] w-full max-w-sm rounded-3xl p-5 sm:p-6 relative shadow-2xl border border-white/10 animate-in slide-in-from-bottom-8 duration-300">
              <div className="flex justify-between items-center mb-5 sm:mb-6">
                <h3 className="text-[17px] sm:text-lg font-semibold">
                  Change mobile network
                </h3>
                <button
                  onClick={() => setIsNetworkModalOpen(false)}
                  className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/10 flex items-center justify-center"
                >
                  <X className="w-4 h-4 text-gray-400" />
                </button>
              </div>

              <div className="space-y-2.5 sm:space-y-3">
                {[
                  { name: "MTN", icon: "/mtn.svg", isBest: true },
                  { name: "Airtel", icon: "/airtel.svg", isBest: false },
                  { name: "Glo", icon: "/glo.svg", isBest: false },
                ].map((n) => (
                  <div
                    key={n.name}
                    onClick={() => {
                      setNetwork(n.name as any);
                      setIsNetworkModalOpen(false);
                    }}
                    className="bg-[#1C1C1E] p-3.5 sm:p-4 rounded-2xl flex items-center gap-3 sm:gap-4 cursor-pointer hover:bg-[#2C2C2E] border border-transparent hover:border-white/10 transition-all"
                  >
                    <img
                      src={n.icon}
                      alt={`${n.name} logo`}
                      className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover bg-white shrink-0"
                    />
                    <span className="font-semibold text-[14px] sm:text-[15px]">
                      {n.name}
                    </span>
                    {n.isBest && (
                      <span className="ml-auto sm:ml-2 bg-orange-100/90 text-orange-400 text-[9px] sm:text-[10px] font-bold px-2 py-0.5 rounded-md">
                        Suggested
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Confirm Payment Modal */}
        {isConfirmModalOpen && (
          <div className="absolute inset-0 z-50 flex items-end bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            {/* Added max-h-[90dvh] and flex-col to handle very short screens so content scrolls instead of hiding the Pay button */}
            <div className="bg-[#111111] w-full max-h-[90dvh] flex flex-col rounded-t-3xl relative animate-in slide-in-from-bottom-8 duration-300 border-t border-white/10">
              <div className="p-5 sm:p-6 pb-6 sm:pb-10 overflow-y-auto custom-scrollbar flex-1">
                <button
                  onClick={() => setIsConfirmModalOpen(false)}
                  className="absolute top-4 right-4 sm:top-5 sm:right-5 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
                >
                  <X className="w-4 h-4 text-gray-400" />
                </button>

                <div className="text-center mt-4 sm:mt-6 mb-6 sm:mb-8 flex flex-col items-center shrink-0">
                  <h2 className="text-3xl sm:text-4xl font-bold text-white mb-1.5 sm:mb-2">
                    ₦ {parseInt(amount) - discountAmount}
                  </h2>
                  <div className="flex items-center gap-2 text-gray-500 text-[13px] sm:text-sm font-medium">
                    <span>N{amount}</span>
                    <span className="bg-[#EAE5FF] text-[#5B3EE4] px-2 py-0.5 rounded-md text-[10px] sm:text-[11px] font-bold">
                      Save ₦ {discountAmount}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 sm:gap-3 mb-5 sm:mb-6 bg-[#18181B] border border-white/5 p-3.5 sm:p-4 rounded-xl shrink-0">
                  <span className="text-[13px] sm:text-sm text-gray-500 font-medium">
                    TO:
                  </span>
                  <img
                    src={`/${network.toLowerCase()}.svg`}
                    alt={`${network} logo`}
                    className="w-4 h-4 sm:w-5 sm:h-5 rounded-full object-cover bg-white shrink-0"
                  />
                  <span className="text-blue-500 text-[13px] sm:text-sm font-semibold">
                    {network}
                  </span>
                  <span className="text-gray-400 text-[13px] sm:text-sm ml-auto truncate">
                    "{phone}"
                  </span>
                </div>

                <div className="space-y-2.5 sm:space-y-3 mb-6 sm:mb-8 shrink-0">
                  <div className="bg-[#1C1C1E] p-4 sm:p-5 rounded-2xl space-y-3 sm:space-y-4">
                    <div className="flex justify-between items-center text-[13px] sm:text-sm">
                      <span className="text-gray-400">Airtime Value</span>
                      <span className="font-medium text-white">₦ {amount}</span>
                    </div>
                    <div className="flex justify-between items-center text-[13px] sm:text-sm">
                      <span className="text-gray-400">Discount Applied</span>
                      <span className="font-medium text-[#8B5CF6]">
                        ₦ {discountAmount}
                      </span>
                    </div>
                  </div>

                  <div className="bg-[#1C1C1E] p-4 sm:p-5 rounded-2xl">
                    <div className="flex justify-between items-center text-[14px] sm:text-[15px] font-bold">
                      <span className="text-gray-400 font-normal">
                        Total debit
                      </span>
                      <span className="text-[#8B5CF6]">
                        ₦ {parseInt(amount) - discountAmount}
                      </span>
                    </div>
                  </div>
                </div>

                <Button
                  onClick={handlePay}
                  className="w-full h-12 sm:h-14 rounded-2xl bg-[#8B5CF6] hover:bg-[#7C3AED] text-white font-semibold text-[15px] sm:text-[17px] shadow-none shrink-0"
                >
                  Pay ₦{parseInt(amount) - discountAmount}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
