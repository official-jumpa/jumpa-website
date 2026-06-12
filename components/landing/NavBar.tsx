import Image from "next/image";
import Link from "next/link";

export default function NavBar() {
  return (
    <nav className="flex justify-between items-center container w-full py-5 mx-auto">
      <Link href="/">
        <Image
          src={"/assets/logos/brand/Jumpa Typo I@4x.png"}
          alt="Jumpa Logo"
          width={145}
          height={145}
        />
      </Link>

      <div className="flex items-center gap-14">
        <div className="flex items-center gap-10.5 font-semibold text-2xl text-black">
          <Link href="#features">Features</Link>
          <Link href="#use-cases">Use cases</Link>
          <Link href="#faqs">FAQs</Link>
        </div>
        <Link href="/onboarding" className="jumpa-btn-primary">
          Contact us
        </Link>
      </div>
    </nav>
  );
}
