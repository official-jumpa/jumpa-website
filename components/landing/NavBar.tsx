import Image from "next/image";
import Link from "next/link";

export default function NavBar() {
  return (
    <nav className="flex justify-between items-center container w-full py-5 px-5 md:px-5 mx-auto">
      <Link href="/">
        <Image
          src={"/assets/logos/brand/Jumpa Typo I@4x.png"}
          alt="Jumpa Logo"
          width={145}
          height={145}
        />
      </Link>

      <div className="flex items-center gap-4 md:gap-14">
        <div className="hidden md:flex justify-center items-center gap-4 md:gap-10.5 font-semibold text-lg md:text-2xl text-black">
          <Link href="#features">Features</Link>
          <Link href="#use-cases">Use cases</Link>
          <Link href="#faqs">FAQs</Link>
        </div>
        <Link
          href="/onboarding"
          className="jumpa-btn-primary px-4 py-2 md:px-6 md:py-3 text-sm md:text-base whitespace-nowrap"
        >
          Contact us
        </Link>
      </div>
    </nav>
  );
}
