'use client'

import { translations } from "@/lib/i18n"
import { FaGithub, FaLinkedin, FaInstagram, FaEnvelope } from "react-icons/fa"
import Link from "next/link"

const Footer = ({ locale }: { locale: "cs" | "en" }) => {
  const t = translations[locale]
  const year = new Date().getFullYear()

  return (
    <footer className="py-6 border-t border-[var(--foreground)]/30 mt-[150px] text-sm">
      {/* Ikony */}
      <div className="flex flex-col items-center justify-center gap-4 mb-4">
        <div className="flex gap-4 text-3xl text-[var(--foreground)]">
          <a
            href="https://github.com/JiKl-coding?tab=repositories"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub"
            className="hover:text-primary transition-colors duration-200"
          >
            <FaGithub />
          </a>
          <a
            href="https://www.linkedin.com/in/jiří-klatovský-8605417b/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="LinkedIn"
            className="hover:text-primary transition-colors duration-200"
          >
            <FaLinkedin />
          </a>
          <a
            href="https://www.instagram.com/jikl_aurelist/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Instagram"
            className="hover:text-primary transition-colors duration-200"
          >
            <FaInstagram />
          </a>
          <a
            href="mailto:jikl.coding@gmail.com"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Email"
            className="hover:text-primary transition-colors duration-200"
          >
            <FaEnvelope />
          </a>
        </div>
      </div>

      {/* Hlavní obsah */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 px-6 text-center md:text-left">
        {/* Levý blok */}
        <div className="flex flex-col gap-1">
          <p>&copy; {year} JiKl-coding – {t.footer.rights}</p>

          <Link
            href={locale === "cs" ? "/docs/obchodni-podminky.pdf" : "/docs/terms-of-service.pdf"}
            className="hover:underline font-bold"
            target="_blank"
            rel="noopener noreferrer"
          >
            {locale === "cs" ? "Obchodní podmínky" : "Terms of Service"}
          </Link>

          <Link
            href={locale === "cs" ? "/docs/gdpr.pdf" : "/docs/privacy-policy.pdf"}
            className="hover:underline font-bold"
            target="_blank"
            rel="noopener noreferrer"
          >
            GDPR
          </Link>
        </div>


        {/* Pravý blok */}
        <div className="flex flex-col gap-1 text-center md:text-right">
          <p><strong>Jiří Klatovský</strong></p>
          <p><strong>IČO:</strong> 23307421</p>
          <p><strong>{locale === "cs" ? "Sídlo" : "Registered office"}:</strong> V Hůrkách 2145/1, 158 00, Praha 5 – Stodůlky</p>
          <p>
            {locale === "cs"
              ? "Zapsán v živnostenském rejstříku vedeném ÚMČ Praha 13"
              : "Registered in the Trade Register maintained by Prague 13 District Office"}
          </p>
          <p>{locale === "cs" ? "Nejsem plátcem DPH" : "Not a VAT payer"}</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
