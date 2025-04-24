'use client'

import { translations } from "@/lib/i18n"
import { FaGithub, FaLinkedin, FaInstagram } from "react-icons/fa"

const Footer = ({ locale }: { locale: "cs" | "en" }) => {
  const t = translations[locale]

  return (
    <footer className="py-6 text-center min-h-[60px] border-t border-[var(--foreground)]/30 mt-12">
      <div className="flex flex-col items-center justify-center gap-4">
        <div className="flex gap-4 text-4xl text-[var(--foreground)]">
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
        </div>
        <p className="text-lg font-semibold">
          &copy; {new Date().getFullYear()} JiKl-coding – {t.footer.rights}
        </p>
      </div>
    </footer>
  )
}

export default Footer
