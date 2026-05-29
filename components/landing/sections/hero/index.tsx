
import { useTranslation } from "react-i18next";
import Navbar from "@/components/ui/navbar";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useRouter } from 'next/navigation';
import ComingSoonModal from "@/components/modal/coming-soon";

export default function HeroSection() {
  const router = useRouter();
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  
  const handleOnboardingNavigate = () => {
    router.push('/onboarding')
  };

  return (
    <div className="bg-white relative min-h-screen w-full overflow-hidden">


      {/* Soft Light Pink Gradient Background */}
      <div className="absolute inset-0 bg-linear-to-b from-[#000000] to-[#260053]
"></div>
      <Navbar />

      {/* Hero Section */}
      <section
        id="home"
        className="relative flex flex-col md:flex-row items-center justify-center min-h-screen px-6 md:px-12 lg:px-20 pt-20 md:pt-10 gap-8 md:gap-12"
      >
        {/* Left Text Section */}
        <div className="flex flex-col justify-center lg:items-start lg:text-start items-center text-center max-w-md space-y-5">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-semibold text-white leading-tight">
            {t("hero.title")}
          </h1>

          <p className="sm:text-lg font-extralight text-gray-400 leading-relaxed">
            {t("hero.subtitle")}
          </p>

          <div className="flex flex-wrap gap-4 mt-4">
            <Button onClick={handleOnboardingNavigate} className="px-6 sm:px-8 md:px-10 py-6 bg-[#9A24F6] hover:bg-[#d8a8fc] rounded-full cursor-pointer hover:scale-105 transition-transform duration-300">
              {t("hero.cta.primary")}
            </Button>

            <Button onClick={() => setOpen(true)} className="px-6 sm:px-8 md:px-10 py-6 bg-[#DCB9F8] hover:bg-[#bf70fc] hover:text-white text-[#9A24F6] rounded-full cursor-pointer hover:scale-105 transition-transform duration-300">
              {t("hero.cta.secondary")}
            </Button>
          </div>
        </div>

        {/* Right Hero Image */}
        <div className="flex justify-center items-center w-full md:w-1/2">
          <img
            src="/heromain.svg"
            alt="Hero Mockup"
            className="w-full h-auto max-w-[500px] md:max-w-[650px] lg:max-w-[800px]"
          />
        </div>
      </section>

      <ComingSoonModal open={open} onClose={() => setOpen(false)} />
    </div>
  );
}
