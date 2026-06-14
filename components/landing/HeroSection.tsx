export default function HeroSection() {
  return (
    <section className="flex flex-col">
      <div className="flex flex-col gap-6 items-center">
        <div className="border-2 rounded-full py-2.5 px-5 border-[#961BF04D] bg-white w-max text-2xl text-[#0C0C0C]">
          Trusted by 40+ Businesses globally
        </div>
        <h1 className="font-black-han-sans text-[80px] leading-24 text-center relative">
          Cross border <span className="text-[#961BF0]">Payment</span>
          <br />
          <span className="absolute top-14.5 left-15 text-white text-[40px] flex justify-center items-center w-37 h-18.5 bg-[linear-gradient(90deg,#961BF0_0%,#E17DFF_100%)] rounded-full rotate-2">
            For
          </span>
          SMEs & Remittance
        </h1>
        <p className="text-[#0C0C0C] text-[32px] leading-12 text-center">
          Connecting African businesses to the global economy instantly
          <br />
          by modernizing Africa's $100B+ SME trade economy
        </p>
      </div>

      <div className="flex items-end gap-2">
        <div className="relative">
          <div className="w-full absolute top-25 flex justify-center">
            <button className="jumpa-btn-primary w-116">Start now</button>
          </div>
          <img src="/assets/images/hero-bg.png" alt="" />
        </div>
      </div>
    </section>
  );
}
