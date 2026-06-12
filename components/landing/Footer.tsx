import Image from "next/image";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="flex flex-col gap-13.5 bg-[#F9FAFB] items-center container w-full py-14 px-40 mx-auto">
      <div className="flex items-center gap-6 w-full">
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

        <span className="ml-auto text-[#948698] font-medium">
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
