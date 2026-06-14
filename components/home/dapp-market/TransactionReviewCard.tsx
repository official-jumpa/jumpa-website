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
    <section className="rounded-[20px] bg-[#2d2d2d] p-[15px] flex flex-col gap-2.5">
      <p className="m-0 text-[#d5d5d5] text-xs leading-[1.45]">{title}</p>
      <div className="flex items-center justify-between gap-3 w-full">
        <span className="text-[#8f8f8f] text-xs leading-[1.45]">{receiveLabel}</span>
        <strong className="text-white text-xs leading-[1.45] font-bold">{receiveValue}</strong>
      </div>
      <div className="flex items-center justify-between gap-3 w-full">
        <span className="text-[#8f8f8f] text-xs leading-[1.45]">{valueLabel}</span>
        <strong className="text-white text-xs leading-[1.45] font-bold">{valueAmount}</strong>
      </div>
      <div className="flex items-center justify-between gap-3 w-full">
        <span className="text-[#8f8f8f] text-xs leading-[1.45]">{toLabel}</span>
        <strong className="text-white text-xs leading-[1.45] font-bold">{toValue}</strong>
      </div>
      <div className="flex items-center justify-between gap-3 w-full">
        <span className="text-[#8f8f8f] text-xs leading-[1.45]">Network fee</span>
        <strong className="text-white text-xs leading-[1.45] font-bold">{networkFee}</strong>
      </div>
    </section>
  );
}