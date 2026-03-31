import { useEffect, useState, type CSSProperties } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowUp, Plus } from "lucide-react";
/** Landing / demo accent (composer, send, user bubble) */
const PRIMARY = "#aa2aff";

/** Tight stack so shadows aren’t clipped by the landing `main` overflow; still reads “floating”. */
const COMPOSER_SHADOW =
  "0 1px 0 rgba(0, 0, 0, 0.04), 0 8px 20px -6px rgba(0, 0, 0, 0.1), 0 2px 8px -2px rgba(0, 0, 0, 0.06)";

/** Landing only: lg+ frame scaled to fit headline + marquee + “for you” in one viewport (laptops). */
const LG_LANDING_SCALE = 0.72;
/** Reserved row height for scaled phone (visual height ≈ 511 × scale). */
const LG_LANDING_LAYOUT_H = Math.round(511 * LG_LANDING_SCALE);
/** Composer width matches horizontal scale of lg frame (380 × 1.1 × scale). */
const LG_COMPOSER_WIDTH_PX = Math.round(380 * 1.1 * LG_LANDING_SCALE);

const SCENARIOS = [
  {
    user: "Buy 0.1 ETH when price drops 10%",
    responses: [
      "📊 Price alert is live",
      "I’ll buy 0.1 ETH when ETH dips 10% from now",
    ],
  },
  {
    user: "Save $50 weekly to savings wallet",
    responses: [
      "💰 Weekly save turned on",
      "$50 every Monday → your Savings wallet",
    ],
  },
  {
    user: "Send ₦2,000 to Mama on OPay",
    responses: [
      "✅ OPay transfer ready",
      "₦2,000 → Mama · Confirm with PIN to send instantly",
    ],
  },
  {
    user: "Send GH₵5,000 to 022767877 MoMo",
    responses: [
      "📱 MoMo payout drafted",
      "GH₵5,000 → 022767877 · Est. fee ~GH₵55 · Confirm to send",
    ],
  },
  {
    user: "Pay my electricity bill for this month",
    responses: [
      "⚡ Bill pulled · ₦18,200 outstanding",
      "Pay from NGN balance or linked card?",
    ],
  },
  {
    user: "Swap $200 USDT to naira at best rate",
    responses: [
      "🔄 Quote locked 45s",
      "$200 USDT → ~₦312,400 · Tap confirm to swap",
    ],
  },
  {
    user: "Remind me to send school fees every 5th",
    responses: [
      "🔔 Recurring reminder set",
      "“School fees” on the 5th each month · 8:00 AM",
    ],
  },
  {
    user: "Split dinner ₦24,000 four ways with the crew",
    responses: [
      "👥 Split created",
      "₦6,000 each · Requests sent to Tunde, Kemi, Chidi",
    ],
  },
] as const;

type DemoPhase = "composer" | "bubble" | "r1" | "r2" | "cooldown";

function useJumpaDemo() {
  const reduceMotion = useReducedMotion();
  const [si, setSi] = useState(0);
  const [phase, setPhase] = useState<DemoPhase>("composer");
  const [composerText, setComposerText] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const scenario = SCENARIOS[si]!;

  useEffect(() => {
    if (reduceMotion) return;

    let t: ReturnType<typeof setTimeout>;
    const clear = () => clearTimeout(t);

    if (phase === "composer") {
      const full = scenario.user;
      let i = 0;
      let cancelled = false;
      setComposerText("");
      setIsTyping(true);
      const typeNext = () => {
        if (cancelled) return;
        if (i <= full.length) {
          setComposerText(full.slice(0, i));
          i++;
          t = setTimeout(typeNext, 28);
        } else {
          setIsTyping(false);
          t = setTimeout(() => {
            if (!cancelled) setPhase("bubble");
          }, 600);
        }
      };
      t = setTimeout(typeNext, 700);
      return () => {
        cancelled = true;
        clear();
      };
    }

    if (phase === "bubble") {
      t = setTimeout(() => setPhase("r1"), 400);
      return clear;
    }
    if (phase === "r1") {
      t = setTimeout(() => setPhase("r2"), 1400);
      return clear;
    }
    if (phase === "r2") {
      t = setTimeout(() => setPhase("cooldown"), 700);
      return clear;
    }
    if (phase === "cooldown") {
      t = setTimeout(() => {
        setSi((j) => (j + 1) % SCENARIOS.length);
        setPhase("composer");
      }, 3200);
      return clear;
    }

    return clear;
  }, [phase, si, scenario.user, reduceMotion]);

  if (reduceMotion) {
    const s = SCENARIOS[0]!;
    return {
      composerText: "",
      isTyping: false,
      userLine: s.user,
      r1: s.responses[0]!,
      r2: s.responses[1]!,
      showUserInChat: true,
      r1Visible: true,
      r2Visible: true,
    };
  }

  return {
    composerText: phase === "composer" ? composerText : "",
    isTyping: phase === "composer" && isTyping,
    userLine: scenario.user,
    r1: scenario.responses[0]!,
    r2: scenario.responses[1]!,
    showUserInChat: phase !== "composer",
    r1Visible:
      phase === "r1" || phase === "r2" || phase === "cooldown",
    r2Visible: phase === "r2" || phase === "cooldown",
  };
}

function SideButtonsMobile() {
  return (
    <div
      className="pointer-events-none absolute inset-0 z-10"
      aria-hidden
    >
      <div
        className="pointer-events-auto absolute rounded-l-sm"
        style={{
          left: 2,
          top: 90,
          width: 5,
          height: 25,
          backgroundColor: "rgba(180,180,180,0.5)",
          borderRadius: "2px 0 0 2px",
        }}
      />
      <div
        className="pointer-events-auto absolute rounded-l-sm"
        style={{
          left: 2,
          top: 130,
          width: 5,
          height: 35,
          backgroundColor: "rgba(180,180,180,0.5)",
          borderRadius: "2px 0 0 2px",
        }}
      />
      <div
        className="pointer-events-auto absolute rounded-l-sm"
        style={{
          left: 2,
          top: 175,
          width: 5,
          height: 35,
          backgroundColor: "rgba(180,180,180,0.5)",
          borderRadius: "2px 0 0 2px",
        }}
      />
      <div
        className="pointer-events-auto absolute rounded-r-sm"
        style={{
          right: 2,
          top: 135,
          width: 5,
          height: 50,
          backgroundColor: "rgba(180,180,180,0.5)",
          borderRadius: "0 2px 2px 0",
        }}
      />
    </div>
  );
}

function SideButtonsSm() {
  return (
    <div className="pointer-events-none absolute inset-0 z-10" aria-hidden>
      <div
        className="pointer-events-auto absolute"
        style={{
          left: 2,
          top: 110,
          width: 5,
          height: 30,
          backgroundColor: "rgba(180,180,180,0.2)",
          borderRadius: "2px 0 0 2px",
        }}
      />
      <div
        className="pointer-events-auto absolute"
        style={{
          left: 2,
          top: 155,
          width: 5,
          height: 40,
          backgroundColor: "rgba(180,180,180,0.2)",
          borderRadius: "2px 0 0 2px",
        }}
      />
      <div
        className="pointer-events-auto absolute"
        style={{
          left: 2,
          top: 210,
          width: 5,
          height: 40,
          backgroundColor: "rgba(180,180,180,0.2)",
          borderRadius: "2px 0 0 2px",
        }}
      />
      <div
        className="pointer-events-auto absolute"
        style={{
          right: 2,
          top: 165,
          width: 5,
          height: 60,
          backgroundColor: "rgba(180,180,180,0.2)",
          borderRadius: "0 2px 2px 0",
        }}
      />
    </div>
  );
}

function SideButtonsLg() {
  return (
    <div className="pointer-events-none absolute inset-0 z-10" aria-hidden>
      <div
        className="pointer-events-auto absolute"
        style={{
          left: 1,
          top: 120,
          width: 4,
          height: 30,
          backgroundColor: "rgba(180,180,180,0.2)",
          borderRadius: "2px 0 0 2px",
        }}
      />
      <div
        className="pointer-events-auto absolute"
        style={{
          left: 1,
          top: 165,
          width: 4,
          height: 40,
          backgroundColor: "rgba(180,180,180,0.2)",
          borderRadius: "2px 0 0 2px",
        }}
      />
      <div
        className="pointer-events-auto absolute"
        style={{
          left: 1,
          top: 220,
          width: 4,
          height: 40,
          backgroundColor: "rgba(180,180,180,0.2)",
          borderRadius: "2px 0 0 2px",
        }}
      />
      <div
        className="pointer-events-auto absolute"
        style={{
          right: 1,
          top: 175,
          width: 4,
          height: 65,
          backgroundColor: "rgba(180,180,180,0.2)",
          borderRadius: "0 2px 2px 0",
        }}
      />
    </div>
  );
}

function OutgoingBubble({ text }: { text: string }) {
  return (
    <div className="flex w-full justify-end">
      <div className="relative max-w-[75%]">
        <div
          className="px-3 py-2 text-[13px] font-bold leading-[1.4] text-white sm:px-4 sm:py-2.5 sm:text-sm lg:text-[15px]"
          style={{
            borderRadius: 18,
            backgroundColor: PRIMARY,
          }}
        >
          {text}
        </div>
        <motion.div
          className="absolute flex items-end"
          style={{ bottom: -2, right: -2 }}
          initial={false}
        >
          <motion.div
            className="size-4 rounded-full"
            style={{ backgroundColor: PRIMARY }}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1, duration: 0.2 }}
          />
          <motion.div
            className="size-1.5 rounded-full"
            style={{
              backgroundColor: PRIMARY,
              marginBottom: -4,
              marginLeft: -4,
            }}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.2 }}
          />
        </motion.div>
      </div>
    </div>
  );
}

function ChatColumn({
  userLine,
  r1,
  r2,
  showUser,
  r1Visible,
  r2Visible,
}: {
  userLine: string;
  r1: string;
  r2: string;
  showUser: boolean;
  r1Visible: boolean;
  r2Visible: boolean;
}) {
  return (
    <div className="flex h-full flex-col bg-white">
      <div className="relative min-h-0 flex-1 overflow-hidden">
        <div className="flex flex-col gap-4 px-5 pt-[5.25rem] pb-5 sm:px-6 sm:pt-24 sm:pb-6">
          {showUser ? <OutgoingBubble text={userLine} /> : null}
          <div className="mt-1 flex flex-col gap-3">
            {r1Visible ? (
              <motion.div
                className="w-full"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.2 }}
              >
                <div className="max-w-[75%] text-[13px] font-bold leading-[1.4] text-black sm:text-sm lg:text-[15px]">
                  {r1}
                </div>
              </motion.div>
            ) : null}
            {r2Visible ? (
              <motion.div
                className="w-full"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.2 }}
              >
                <div className="max-w-[75%] text-[13px] font-bold leading-[1.4] text-black sm:text-sm lg:text-[15px]">
                  {r2}
                </div>
              </motion.div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

function Composer({
  currentText,
  isTyping,
}: {
  currentText: string;
  isTyping: boolean;
}) {
  const hasText = currentText.length > 0;

  return (
    <motion.div
      className="relative mx-auto w-full rounded-[20px] pl-4 pr-3 py-1 sm:rounded-[28px] sm:pl-5 sm:pr-3 sm:py-3"
      style={{
        backgroundColor: "#ffffff",
        boxShadow: COMPOSER_SHADOW,
        border: "1px solid rgba(228, 228, 228, 0.25)",
      }}
      animate={{ scale: hasText ? 1.02 : 1 }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
    >
      <div className="flex items-center justify-between gap-2 sm:gap-3">
        <div className="flex min-w-0 flex-1 items-center gap-1.5 sm:gap-2">
          <Plus
            className="size-[17px] shrink-0 sm:size-6"
            style={{ color: PRIMARY }}
            strokeWidth={2}
            aria-hidden
          />
          <span className="relative flex min-w-0 flex-1 text-[11px] font-bold leading-tight text-black sm:text-sm lg:text-[15px]">
            <span className="truncate">{currentText}</span>
            {isTyping && hasText ? (
              <span
                className="jumpa-landing-composer-cursor ml-px inline-block h-[1.2em] w-0.5 shrink-0 bg-black align-middle"
                aria-hidden
              />
            ) : null}
          </span>
        </div>
        <motion.button
          type="button"
          className="relative flex size-7 shrink-0 items-center justify-center rounded-full sm:size-10"
          style={{ backgroundColor: PRIMARY }}
          animate={{ scale: hasText && !isTyping ? 1.1 : 1 }}
          transition={{ type: "spring", stiffness: 400, damping: 20 }}
          aria-label="Send"
        >
          <ArrowUp className="size-3.5 text-white sm:size-5" strokeWidth={2.5} />
        </motion.button>
      </div>
    </motion.div>
  );
}

/** Pocket-style shell — three breakpoints, pixel-matched; Jumpa landing demo. */
export default function JumpaPhoneDemo() {
  const demo = useJumpaDemo();

  const chatProps = {
    userLine: demo.userLine,
    r1: demo.r1,
    r2: demo.r2,
    showUser: demo.showUserInChat,
    r1Visible: demo.r1Visible,
    r2Visible: demo.r2Visible,
  };

  return (
    <div className="jumpa-landing-phone-demo relative flex shrink-0 flex-col items-center">
      {/* Jump in lives in landing hero above this component (all breakpoints). */}
      {/* Mobile — matches webpack `block sm:hidden` */}
      <div className="relative sm:hidden" style={{ width: 290, height: 376 }}>
        <SideButtonsMobile />
        <div
          className="relative mx-auto overflow-hidden"
          style={{ width: 280, height: 376, marginLeft: 5 }}
        >
          <div
            className="absolute bg-white"
            style={{
              width: 280,
              height: 607,
              borderRadius: 37,
              border: "1px solid rgba(228, 228, 228, 0.6)",
              bottom: -231,
            }}
          >
            <div
              className="absolute left-1/2 z-10 -translate-x-1/2 rounded-full"
              style={{
                top: 12,
                width: 95,
                height: 27,
                border: "1px solid rgba(228, 228, 228, 0.6)",
                backgroundColor: "transparent",
              }}
            />
            <div
              className="absolute overflow-hidden bg-white"
              style={{
                top: 0,
                left: 0,
                right: 0,
                height: 376,
                borderTopLeftRadius: 37,
                borderTopRightRadius: 37,
              }}
            >
              <ChatColumn {...chatProps} />
            </div>
          </div>
        </div>
      </div>

      {/* sm / md */}
      <div
        className="relative hidden sm:block lg:hidden"
        style={{ width: 350, height: 457 }}
      >
        <SideButtonsSm />
        <div
          className="relative mx-auto overflow-hidden"
          style={{ width: 340, height: 457, marginLeft: 5 }}
        >
          <div
            className="absolute bg-white"
            style={{
              width: 340,
              height: 737,
              borderRadius: 44,
              border: "1px solid rgba(228, 228, 228, 0.6)",
              bottom: -280,
            }}
          >
            <div
              className="absolute left-1/2 z-10 -translate-x-1/2 rounded-full"
              style={{
                top: 15,
                width: 115,
                height: 32,
                border: "1px solid rgba(228, 228, 228, 0.6)",
                backgroundColor: "transparent",
              }}
            />
            <div
              className="absolute overflow-hidden bg-white"
              style={{
                top: 0,
                left: 0,
                right: 0,
                height: 457,
                borderTopLeftRadius: 44,
                borderTopRightRadius: 44,
              }}
            >
              <ChatColumn {...chatProps} />
            </div>
          </div>
        </div>
      </div>

      {/* lg+ — scaled on landing so the rest of the page fits laptop viewports */}
      <div
        className="relative hidden w-full justify-center overflow-hidden lg:flex"
        style={{ height: LG_LANDING_LAYOUT_H }}
      >
        <div
          className="flex flex-col items-center"
          style={{
            transform: `scale(${LG_LANDING_SCALE})`,
            transformOrigin: "top center",
          }}
        >
          <div className="relative" style={{ width: 390, height: 511 }}>
            <SideButtonsLg />
            <div
              className="relative mx-auto overflow-hidden"
              style={{ width: 380, height: 511, marginLeft: 5 }}
            >
              <div
                className="absolute bg-white"
                style={{
                  width: 380,
                  height: 824,
                  borderRadius: 48,
                  border: "1px solid rgba(228, 228, 228, 0.6)",
                  bottom: -313,
                }}
              >
                <div
                  className="absolute left-1/2 z-10 -translate-x-1/2 rounded-full"
                  style={{
                    top: 17,
                    width: 128,
                    height: 36,
                    border: "1px solid rgba(228, 228, 228, 0.6)",
                    backgroundColor: "transparent",
                  }}
                />
                <div
                  className="absolute overflow-hidden bg-white"
                  style={{
                    top: 0,
                    left: 0,
                    right: 0,
                    height: 511,
                    borderTopLeftRadius: 48,
                    borderTopRightRadius: 48,
                  }}
                >
                  <ChatColumn {...chatProps} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Composer overlaps frame bottom */}
      <div
        className="relative z-10 -mt-4 w-[calc(280px*1.1)] sm:-mt-5 sm:w-[calc(340px*1.1)] lg:-mt-4 lg:w-[var(--jumpa-lg-composer-w)]"
        style={
          {
            "--jumpa-lg-composer-w": `${LG_COMPOSER_WIDTH_PX}px`,
          } as CSSProperties
        }
      >
        <Composer currentText={demo.composerText} isTyping={demo.isTyping} />
      </div>
    </div>
  );
}
