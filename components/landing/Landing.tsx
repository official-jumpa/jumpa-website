import NavBar from "./NavBar";
import HeroSection from "./HeroSection";
import StatsBar from "./StatsBar";
import FeaturesGrid from "./FeaturesGrid";
import PersonasGrid from "./PersonasGrid";
import FAQSection from "./FAQSection";
import Footer from "./Footer";
import "./landing.css";

export default function Landing() {
  return (
    <div className="landing bg-[#fffdf2] text-black flex flex-col gap-8">
      <NavBar />
      <main className="container w-full mx-auto">
        <HeroSection />
        <StatsBar />
        <FeaturesGrid />
        <PersonasGrid />
        <FAQSection />
      </main>
      <Footer />
    </div>
  );
}
