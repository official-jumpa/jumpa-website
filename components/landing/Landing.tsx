const jumpaTypoLogo = '/assets/logos/brand/Jumpa Typo I@4x.png';
import Link from 'next/link';
import JumpaPhoneDemo from "./JumpaPhoneDemo";
import "./landing.css";

const CAPABILITIES = [
  { emoji: "💳", label: "Pay Bills", bg: "#22D9504d", color: "#22D950" },
  { emoji: "♾️", label: "Withdraw", bg: "#1D00FB4d", color: "#1D00FB" },
  { emoji: "🔄", label: "Swap", bg: "#DE00FB4d", color: "#DE00FB" },
  { emoji: "↑", label: "Send", bg: "#aa2aff4d", color: "#aa2aff" },
  { emoji: "🎯", label: "Save", bg: "#FB64004d", color: "#FB6400" },
  { emoji: "📈", label: "Invest", bg: "#FF19044d", color: "#FF1904" },
  { emoji: "📊", label: "Track", bg: "#22D9504d", color: "#22D950" },
  { emoji: "💰", label: "Budget", bg: "#FFC3004d", color: "#FFC300" },
] as const;

const MARQUEE_ITEMS = [...CAPABILITIES, ...CAPABILITIES, ...CAPABILITIES];

export default function Landing() {
  return (
    <main className="jumpa-landing flex h-svh max-h-svh flex-col overflow-hidden text-zinc-900 antialiased selection:bg-violet-200/60 selection:text-violet-950 sm:h-[min(100dvh,100svh)] sm:max-h-[min(100dvh,100svh)]">
      {/*
        Hero: same column on all breakpoints — header (logo | Coming Soon) → purple Jump in → phone.
      */}
      <div className="jumpa-landing-reveal jumpa-landing-reveal--2 shrink-0 bg-white">
        <div className="mx-auto flex w-full max-w-full flex-col px-3 pb-1 pt-3 sm:max-w-[768px] sm:px-10 sm:pt-5 lg:max-w-[1280px] lg:px-20 lg:pt-3 xl:max-w-[1440px] xl:px-[120px]">
          <div className="flex items-center justify-between gap-3">
            <img
              src={jumpaTypoLogo}
              alt="Jumpa"
              width={139}
              height={36}
              decoding="async"
              className="relative z-20 h-10 w-auto min-h-0 max-w-[58%] origin-left scale-[2.45] object-contain object-left sm:h-11 sm:max-w-none sm:scale-[3.075] sm:self-start md:scale-[3.225] lg:scale-[3.3]"
            />
            <span className="shrink-0 text-right text-sm font-bold whitespace-nowrap text-foreground md:text-base lg:text-lg">
              Coming Soon
            </span>
          </div>

          <Link
            href="/onboarding"
            className="jumpa-landing-jump-in jumpa-landing-jump-in--hero mt-3 inline-flex shrink-0 items-center justify-center self-center rounded-lg bg-[#aa2aff] px-4 py-1.5 text-[11px] font-semibold tracking-wide text-white shadow-[0_1px_6px_-2px_rgba(170,42,255,0.4)] transition-[background-color,box-shadow,transform] hover:bg-[#9618e8] hover:shadow-[0_2px_8px_-3px_rgba(170,42,255,0.35)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/90 focus-visible:ring-offset-1 focus-visible:ring-offset-[#aa2aff] active:scale-[0.98] sm:mt-4 sm:px-5 sm:py-1.5 sm:text-xs lg:mt-3 lg:px-5 lg:py-2"
          >
            Jump in
          </Link>

          <div className="mt-4 flex min-w-0 justify-center sm:mt-5 lg:mt-4">
            <JumpaPhoneDemo />
          </div>
        </div>
      </div>

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <section className="jumpa-landing-reveal jumpa-landing-reveal--3 flex min-h-0 flex-1 flex-col items-stretch justify-center gap-2 overflow-hidden bg-white px-3 pt-4 pb-3 sm:justify-start sm:gap-5 sm:px-6 sm:pt-6 sm:pb-6 md:gap-6 md:px-8 md:pb-8 lg:gap-2 lg:pt-2 lg:pb-3">
          <h1 className="shrink-0 text-center text-lg font-bold leading-tight tracking-tight text-gray-900 sm:text-xl md:text-2xl lg:text-2xl xl:text-4xl">
            An AI wallet that can
          </h1>

          <div className="jumpa-landing-marquee__viewport relative flex w-full min-h-0 min-w-0 flex-1 items-center sm:min-h-[3rem] md:min-h-[3.25rem] lg:min-h-0 lg:flex-none lg:py-0">
            <div
              className="jumpa-landing-marquee__fade jumpa-landing-marquee__fade--left"
              aria-hidden
            />
            <div
              className="jumpa-landing-marquee__fade jumpa-landing-marquee__fade--right"
              aria-hidden
            />
            <div className="jumpa-landing-marquee__track items-center">
              {MARQUEE_ITEMS.map((item, i) => (
                <span
                  key={`${item.label}-${i}`}
                  className="jumpa-landing-marquee__pill inline-flex h-8 shrink-0 items-center gap-1.5 rounded-full border border-black/[0.07] px-3 py-1 text-xs font-semibold leading-tight whitespace-nowrap shadow-[0_1px_0_rgba(0,0,0,0.04)] sm:h-auto sm:gap-1.5 sm:px-3 sm:py-1.5 sm:text-xs sm:font-medium md:gap-2 md:px-3.5 md:py-2 md:text-sm lg:min-h-9 lg:gap-1.5 lg:px-3 lg:py-1.5 lg:text-sm lg:font-semibold xl:min-h-11 xl:gap-2 xl:px-4 xl:py-2.5 xl:text-base"
                  style={{
                    backgroundColor: item.bg,
                    color: item.color,
                  }}
                >
                  <span
                    className="inline-flex size-5 shrink-0 items-center justify-center text-base leading-none sm:h-auto sm:w-auto sm:min-w-0 sm:text-sm md:text-base lg:size-6 lg:text-base xl:size-8 xl:text-xl"
                    aria-hidden
                  >
                    {item.emoji}
                  </span>
                  {item.label}
                </span>
              ))}
            </div>
          </div>

          <p className="shrink-0 text-center text-lg font-bold leading-tight tracking-tight text-gray-900 sm:text-xl md:text-2xl lg:text-2xl xl:text-4xl">
            for you
          </p>
        </section>
      </div>
    </main>
  );
}
