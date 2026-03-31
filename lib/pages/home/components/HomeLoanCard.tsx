interface HomeLoanCardProps {
  onOpenLoanDetail: () => void;
}

export default function HomeLoanCard({ onOpenLoanDetail }: HomeLoanCardProps) {
  const handleOpenLoan = () => {
    sessionStorage.setItem('jumpa-open-loan-detail', 'true');
    onOpenLoanDetail();
  };

  return (
    <section className="home-loan-section" aria-label="Loan">
      <div className="home-loan-section-head">
        <h3>Loan</h3>
      </div>

      <button type="button" className="home-loan-card" onClick={handleOpenLoan}>
        <div className="home-loan-card-main">
          <div className="home-loan-token">U</div>
          <div>
            <p>Loan created</p>
            <span>Feb 16th 2026</span>
          </div>
        </div>
        <strong>0.05757 SOL</strong>
      </button>
    </section>
  );
}