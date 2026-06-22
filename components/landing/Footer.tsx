import Image from "next/image";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="flex flex-col gap-8 md:gap-13.5 bg-[#F9FAFB] items-center container w-full py-8 md:py-14 px-6 md:px-40 mx-auto">
      <div className="flex flex-wrap justify-center md:justify-start items-center gap-4 md:gap-6 w-full">
        <Link href="#" className="text-xs text-[#110A14]">
          Terms
        </Link>
        <Link href="#" className="text-xs text-[#110A14]">
          Privacy Policy
        </Link>
        <Link href="#" className="text-xs text-[#110A14]">
          Ambassadors
        </Link>
        <Link href="#" className="text-xs text-[#110A14]">
          Careers
        </Link>
        <Link href="#" className="text-xs text-[#110A14]">
          Twitter
        </Link>
        <Link href="#" className="text-xs text-[#110A14]">
          Facebook
        </Link>

        <span className="w-full md:w-auto md:ml-auto mt-4 md:mt-0 text-[#948698] font-medium text-center md:text-left text-sm md:text-base">
          © 2026 copyright all rights reserved.
        </span>
      </div>

      <div>
        <Image
          src={"/assets/logos/brand/footer-logo.png"}
          alt="Jumpa Logo"
          width={1175}
          height={246}
        />
      </div>
    </footer>
  );
}
