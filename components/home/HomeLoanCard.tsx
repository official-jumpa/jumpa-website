interface HomeLoanCardProps {
  onOpenLoanDetail: () => void;
}

export default function HomeLoanCard({ onOpenLoanDetail }: HomeLoanCardProps) {
  const handleOpenLoan = () => {
    sessionStorage.setItem('jumpa-open-loan-detail', 'true');
    onOpenLoanDetail();
  };

  return (
    <section className="w-full bg-[#2d2d2d] rounded-2xl p-4 pt-2" aria-label="Loan">
      <div className="flex items-center justify-between mb-2">
        <h3 className="m-0 text-sm font-semibold text-[#f3f3f5]">Loan</h3>
      </div>

      <button type="button" className="w-full border border-[#2a2a30] rounded-[14px] bg-[#1f1f1f] text-[#f3f3f5] flex items-center justify-between p-3 cursor-pointer" onClick={handleOpenLoan}>
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-blue-700 text-white text-sm font-bold inline-flex items-center justify-center">U</div>
          <div className="text-left">
            <p className="m-0 text-[13px] font-semibold">Loan created</p>
            <span className="text-[11px] text-[#8b8b93]">Feb 16th 2026</span>
          </div>
        </div>
        <strong className="text-xs font-semibold text-[#b7b7be]">0.05757 SOL</strong>
      </button>
    </section>
  );
}