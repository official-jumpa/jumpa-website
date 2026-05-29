import { useState } from "react";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import ComingSoonModal from "@/components/modal/coming-soon";

export default function Services() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState(0);
  const [open, setOpen] = useState(false);

  // Fetch data structure
  const tabs = t("services.tabs", { returnObjects: true }) as string[];
  const content = t("services.content", { returnObjects: true }) as Array<{
    title: string;
    description: string;
    button: string;
    image: string;
    theme: {
      primary: string;   // The dark color (Card, Active Tab)
      secondary: string; // The light color (Section Background)
    };
  }>;

  const currentTheme = content[activeTab].theme;

  return (
    <section
      id="services"
      className="py-16 px-4 md:px-8 transition-colors duration-700 ease-in-out"
      style={{ backgroundColor: currentTheme.secondary }}
    >
      <div className="max-w-6xl mx-auto">

        {/* Navigation Tabs */}
        <div className="flex justify-center mb-10">
          <div className="bg-white/80 backdrop-blur-sm p-1.5 rounded-full inline-flex shadow-sm overflow-x-auto max-w-full">
            {tabs.map((tab, index) => (
              <button
                key={index}
                onClick={() => setActiveTab(index)}
                className={`
                  px-6 py-2 rounded-full text-sm font-light transition-all duration-300 whitespace-nowrap
                  ${activeTab === index ? "text-white shadow-md scale-105" : "text-gray-500 hover:text-gray-900"}
                `}
                style={{
                  backgroundColor: activeTab === index ? currentTheme.primary : "transparent"
                }}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Main Content Card */}
        <div className="relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
              className="rounded-[40px] overflow-hidden shadow-2xl min-h-[500px] flex items-center transition-colors duration-500"
              style={{ backgroundColor: currentTheme.primary }}
            >
              <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-8 p-8 md:p-12 lg:p-16 items-center">

                {/* Left Side: Phone Image Container */}
                <div className="relative w-full mx-auto  flex justify-center order-2 lg:order-1">
                  {/* Background Shape behind phone - lighter shade of primary */}
                  {/* <div 
                    className="absolute inset-0 rounded-3xl transform -rotate-6 translate-y-4 scale-90 opacity-20"
                    style={{ backgroundColor: "#ffffff" }} 
                  ></div> */}

                  {/* The Phone Image */}
                  <div className="relative z-10 w-64 md:w-80 overflow-hidden shadow-2xl">
                    <img
                      src={content[activeTab].image}
                      alt="Service Mockup"
                      className="w-full h-full object-contain "
                    />
                  </div>
                </div>

                {/* Right Side: Text Content */}
                <div className="text-white text-center lg:text-left space-y-6 order-1 lg:order-2">
                  <motion.h2
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                    className="text-4xl md:text-5xl font-bold leading-tight whitespace-pre-line"
                  >
                    {content[activeTab].title}
                  </motion.h2>

                  <motion.p
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-white/90 text-lg md:text-xl font-light leading-relaxed max-w-lg mx-auto lg:mx-0"
                  >
                    {content[activeTab].description}
                  </motion.p>

                  <motion.button
                    onClick={() => setOpen(true)}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3 }}
                    className="mt-4 px-8 py-3 rounded-full bg-white font-light text-lg shadow-lg transition-transform hover:scale-105 active:scale-95"
                    style={{ color: currentTheme.primary }}
                  >
                    {content[activeTab].button}
                  </motion.button>
                </div>

              </div>
            </motion.div>
          </AnimatePresence>
        </div>
        <ComingSoonModal open={open} onClose={() => setOpen(false)} />
      </div>
    </section>
  );
}