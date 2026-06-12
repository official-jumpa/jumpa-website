export default function StatsBar() {
  return (
    <section className="container w-full mx-auto bg-[#FFFDF2] flex items-center p-12 justify-center gap-4">
      <div className="text-center flex-1">
        <h2 className="stat text-[80px] text-[#961BF0] leading-24">0.5%</h2>
        <p className="text-[26px] text-[#0C0C0C] font-semibold leading-9">
          Transaction Fee
          <br />
          On successful remittance
        </p>
      </div>
      <div className="text-center flex-1">
        <h2 className="stat text-[80px] text-[#961BF0] leading-24">0.5%</h2>
        <p className="text-[26px] text-[#0C0C0C] font-semibold leading-9">
          Swap Fee
          <br />
          For crypto-fiat bridging
        </p>
      </div>
      <div className="text-center flex-1">
        <h2 className="stat text-[80px] text-[#961BF0] leading-24">0.5%</h2>
        <p className="text-[26px] text-[#0C0C0C] font-semibold leading-9">
          Bill Payments
          <br />
          On automated bill payments
        </p>
      </div>
    </section>
  );
}
