type TransactionReviewCardProps = {
  title: string;
  receiveLabel: string;
  receiveValue: string;
  valueLabel: string;
  valueAmount: string;
  toLabel: string;
  toValue: string;
  networkFee: string;
};

export default function TransactionReviewCard({
  title,
  receiveLabel,
  receiveValue,
  valueLabel,
  valueAmount,
  toLabel,
  toValue,
  networkFee,
}: TransactionReviewCardProps) {
  return (
    <section className="borrow-card">
      <p className="borrow-card-label">{title}</p>
      <div className="borrow-card-row">
        <span className="borrow-muted">{receiveLabel}</span>
        <strong>{receiveValue}</strong>
      </div>
      <div className="borrow-card-row">
        <span className="borrow-muted">{valueLabel}</span>
        <strong>{valueAmount}</strong>
      </div>
      <div className="borrow-card-row">
        <span className="borrow-muted">{toLabel}</span>
        <strong>{toValue}</strong>
      </div>
      <div className="borrow-card-row">
        <span className="borrow-muted">Network fee</span>
        <strong>{networkFee}</strong>
      </div>
    </section>
  );
}