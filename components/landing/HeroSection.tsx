export default function HeroSection() {
  return (
    <section className="flex flex-col">
      <div className="flex flex-col gap-4 md:gap-6 items-center">
        <div className="border-2 rounded-full py-1.5 md:py-2.5 px-3 md:px-5 border-[#961BF04D] bg-white w-max text-sm md:text-2xl text-[#0C0C0C] text-center">
          Trusted by 40+ Businesses globally
        </div>
        <h1 className="font-black-han-sans text-5xl md:text-[80px] leading-tight md:leading-24 text-center relative">
          Cross border <span className="text-[#961BF0]">Payment</span>
          <br />
          <span className="absolute top-10 md:top-14.5 left-2 md:left-15 text-white text-2xl md:text-[40px] flex justify-center items-center w-24 md:w-37 h-12 md:h-18.5 bg-[linear-gradient(90deg,#961BF0_0%,#E17DFF_100%)] rounded-full rotate-2">
            For
          </span>
          SMEs & Remittance
        </h1>
        <p className="text-[#0C0C0C] text-lg md:text-[32px] leading-snug md:leading-12 text-center mt-4 px-4 md:px-0">
          Connecting African businesses to the global economy instantly
          <br />
          by modernizing Africa's $100B+ SME trade economy
        </p>
      </div>

      <div className="flex items-end gap-2">
        <div className="relative">
          <div className="w-full absolute top-10 md:top-25 flex justify-center">
            <button className="jumpa-btn-primary w-64 md:w-116">Start now</button>
          </div>
          <img src="/assets/images/hero-bg.png" alt="" />
        </div>
      </div>
    </section>
  );
}
