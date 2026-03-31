import { useTranslation } from "react-i18next";

export default function Security() {
  const { t } = useTranslation();
  
  // Assuming the translation file returns an array of 4 objects in this order:
  // 0: Payment Security (Blue)
  // 1: Great Security (Green)
  // 2: Jumpa Wallet (Purple)
  // 3: Customer Support (White)
  const cards = t("security.cards", { returnObjects: true }) as {
    title?: string;
    text?: string;
    color?: string; // Hex codes from JSON
    image?: string;
    center?: boolean;
  }[];

  // Helper to determine specific styles based on card index to match the image layout
  const getCardStyle = (index: number) => {
    switch (index) {
      case 0: // Payment Security (Tall Left)
        return "md:row-span-2 bg-[#00008B] text-white"; 
      case 1: // Great Security (Tall Middle)
        return "md:row-span-2 bg-[#006838] text-white items-center justify-center";
      case 2: // Wallet (Top Right)
        return "bg-[#1a0b40] text-white";
      case 3: // Support (Bottom Right)
        return "bg-white text-black";
      default:
        return "bg-gray-100";
    }
  };

  return (
    <section id="security" className="bg-[#E0C3FC] py-10 md:py-16 md:px-6">
      {/* Layout Logic:
        - Mobile: flex-row, overflow-x-auto (horizontal scroll), snap-x
        - Desktop (md): grid, 3 columns, specific row heights
      */}
      <div className="
        w-full max-w-7xl mx-auto
        flex flex-row overflow-x-auto snap-x snap-mandatory gap-4 px-4 pb-4
        md:grid md:grid-cols-3 md:grid-rows-2 md:gap-6 md:overflow-visible md:px-0 md:pb-0
        scrollbar-hide
      ">
        {cards.map((card, i) => (
          <div
            key={i}
            className={`
              relative rounded-3xl p-6 flex flex-col shrink-0 snap-center
              w-[85vw] h-[400px] md:w-auto md:h-auto
              overflow-hidden transition-transform duration-300 hover:scale-[1.01]
              ${getCardStyle(i)}
            `}
          >
            {/* --- CARD 0: Payment Security (Blue) --- */}
            {i === 0 && (
              <>
                <h3 className="text-xl font-bold z-10">{card.title}</h3>
                {/* Placeholder for Cloud 3D Image - Replace src with actual card.image */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <img src="bento0.svg" />
                </div>
                
                {/* White Text Box at bottom */}
                <div className="mt-auto bg-white text-gray-800 p-5 rounded-2xl text-sm leading-relaxed font-light z-10 shadow-lg">
                  {card.text}
                </div>
              </>
            )}

            {/* --- CARD 1: Great Security (Green) --- */}
            {i === 1 && (
              <div className="text-center z-10">
                <h2 className="text-5xl md:text-6xl font-black uppercase leading-tight">
                  {card.title?.split(" ").map((word, w) => (
                    <span key={w} className="block">{word}</span>
                  ))}
                </h2>
              </div>
            )}

            {/* --- CARD 2: Jumpa Wallet (Purple) --- */}
            {i === 2 && (
              <>
                <h3 className="text-xl font-bold z-10 mb-4">{card.title}</h3>
                
                {/* Placeholder for Coins/Wallet 3D Image */}
                <div className="absolute inset-0 flex items-center justify-end">
                   <img src="bento3.svg" />
                </div>

                {/* Text Bubble */}
                <div className="mt-auto relative z-10">
                  <div className="bg-white text-gray-800 p-4 rounded-2xl rounded-bl-none text-sm font-light inline-block max-w-[80%] shadow-lg">
                    {card.text}
                  </div>
                </div>
              </>
            )}

            {/* --- CARD 3: Customer Support (White) --- */}
            {i === 3 && (
              <>
                <h3 className="text-xl font-bold z-10 text-black mb-8">{card.title}</h3>
                
                {/* Visual Pill Shapes mimicking the screenshot */}
                <div className="mt-auto flex flex-col gap-3">
                    <div className="h-12 w-full bg-[#f3e8ff] rounded-full relative overflow-hidden">
                        <div className="absolute top-2 left-4 right-4 h-2 bg-white/50 rounded-full"></div>
                        <div className="absolute bottom-2 left-4 right-12 h-2 bg-white/50 rounded-full"></div>
                    </div>
                    <div className="h-16 w-full bg-[#f3e8ff] rounded-3xl relative overflow-hidden flex items-center px-4">
                        <div className="w-full h-2 bg-white/50 rounded-full"></div>
                    </div>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}