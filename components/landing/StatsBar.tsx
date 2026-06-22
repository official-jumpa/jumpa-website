export default function StatsBar() {
  return (
    <section className="container w-full mx-auto bg-[#FFFDF2] flex flex-col md:flex-row flex-wrap items-center p-8 md:p-12 justify-center gap-8 md:gap-4">
      <div className="text-center flex-1 min-w-[250px]">
        <h2 className="font-black-han-sans text-5xl md:text-[80px] text-[#961BF0] leading-tight md:leading-24">0.5%</h2>
        <p className="text-lg md:text-[26px] text-[#0C0C0C] font-semibold leading-snug md:leading-9">
          Transaction Fee
          <br />
          On successful remittance
        </p>
      </div>
      <div className="text-center flex-1 min-w-[250px]">
        <h2 className="font-black-han-sans text-5xl md:text-[80px] text-[#961BF0] leading-tight md:leading-24">0.5%</h2>
        <p className="text-lg md:text-[26px] text-[#0C0C0C] font-semibold leading-snug md:leading-9">
          Swap Fee
          <br />
          For crypto-fiat bridging
        </p>
      </div>
      <div className="text-center flex-1 min-w-[250px]">
        <h2 className="font-black-han-sans text-5xl md:text-[80px] text-[#961BF0] leading-tight md:leading-24">0.5%</h2>
        <p className="text-lg md:text-[26px] text-[#0C0C0C] font-semibold leading-snug md:leading-9">
          Bill Payments
          <br />
          On automated bill payments
        </p>
      </div>
    </section>
  );
}
