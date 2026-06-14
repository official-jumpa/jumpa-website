export default function FeaturesGrid() {
  return (
    <section
      className="flex flex-col gap-32 pt-14 pb-24 px-14 bg-[linear-gradient(180deg,#FFFEFB_89.42%,#EDD5FF_100%)] relative"
      id="features"
    >
      <div className="absolute bottom-0 right-0">
        <img src="/assets/images/features-bg.png" alt="" width={500} />
      </div>
      <div className="flex flex-col items-center text-center">
        <h2 className="font-black-han-sans text-6xl leading-22.5">
          Move yo<span className="text-[#5E3B78]">ur money w</span>ith ease
          across <br />
          bor<span className="text-[#5E3B78]">der to diff</span>erent part of
          the world.
        </h2>
        <p className="text-[28px]">
          Send money, pay suppliers, and make multi currency. Privately
        </p>
      </div>

      <div className="grid grid-cols-[repeat(auto-fill,minmax(669px,1fr))] gap-4 justify-center items-center">
        <img
          src="/assets/images/illustrations/feature1.svg"
          alt=""
          className="w-full"
        />

        <img
          src="/assets/images/illustrations/feature2.svg"
          alt=""
          className="w-full"
        />
        <img
          src="/assets/images/illustrations/feature3.svg"
          alt=""
          className="col-span-2 w-full"
        />
        <img
          src="/assets/images/illustrations/feature4.svg"
          alt=""
          className="w-full"
        />
        <img
          src="/assets/images/illustrations/feature5.svg"
          alt=""
          className="w-full"
        />
      </div>
    </section>
  );
}
