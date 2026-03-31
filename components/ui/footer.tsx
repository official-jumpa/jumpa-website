import { useTranslation } from "react-i18next";
import { FaTelegram } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";


export default function Footer() {
    const { t } = useTranslation();
    return (
        <footer className="bg-[#FBF6FF] text-black pb-6 px-6 md:px-12 relative overflow-hidden">
            {/* Footer Container */}
            <div className="
        relative 
        py-16 
        w-full mx-auto 
        grid grid-cols-1 
        lg:grid-cols-2 
        gap-10 md:gap-16 lg:gap-32 
        items-start
    ">

                {/* Watermark */}
                <h1
                    className="absolute inset-0 flex items-center justify-center 
                 text-[4rem] sm:text-[6rem] md:text-[8rem] lg:text-[10rem] 
                 font-extrabold text-black/5 tracking-tighter 
                 select-none pointer-events-none z-0"
                >
                    jumpa
                </h1>

                {/* Brand + Legal */}
                <div className="relative z-10 space-y-4">
                    <div className="flex items-center space-x-2">
                        <img
                            src="/logo.svg"
                            alt="jumpa logo"
                            className="w-10 h-10 object-contain"
                        />
                        <h2 className="text-xl font-semibold">jumpa</h2>
                    </div>

                    <ul className="flex flex-row space-x-6 text-gray-600 text-sm">
                        <li>
                            <a href="/privacy-policy" className="hover:text-black transition">
                                {t("footer.policy")}
                            </a>
                        </li>
                        <li>
                            <a href="/terms" className="hover:text-black transition">
                                {t("footer.terms")}
                            </a>
                        </li>
                    </ul>
                </div>

                {/* Socials */}
                <div className="relative z-10 flex flex-wrap gap-3 lg:justify-end">
                    <a
                        href="https://x.com/JumpaBot_"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 border border-gray-300 rounded-md hover:bg-gray-100 transition"
                    >
                        <FaXTwitter />
                    </a>

                    <a
                        href="https://t.me/Jumpatrading"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 border border-gray-300 rounded-md hover:bg-gray-100 transition"
                    >
                        <FaTelegram />
                    </a>

                    {/*<a
                        href="#"
                        className="p-2 border border-gray-300 rounded-md hover:bg-gray-100 transition"
                    >
                        <FaLinkedinIn />
                    </a>
                    <a
                        href="#"
                        className="p-2 border border-gray-300 rounded-md hover:bg-gray-100 transition"
                    >
                        <FaInstagram />
                    </a>
                    <a
                        href="#"
                        className="p-2 border border-gray-300 rounded-md hover:bg-gray-100 transition"
                    >
                        <FaTiktok />
                    </a> */}
                </div>


            </div>

            {/* Bottom Bar */}
            <div className="
      max-w-7xl mx-auto 
      border-t border-gray-200 
      mt-12 pt-6 
      flex flex-col md:flex-row 
      justify-center md:justify-between 
      items-center 
      text-sm text-gray-600 
      gap-4 
      relative z-10
  ">
                <p>
                    © {new Date().getFullYear()} {t("footer.company")}. {t("footer.rights")}
                </p>
            </div>
        </footer>

    );
}
