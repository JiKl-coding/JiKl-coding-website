'use client'

import { translations } from "@/lib/i18n";

const Footer = ({ locale }: { locale: "cs" | "en" }) => {
  const t = translations[locale];

  return (
    <footer className="py-4 text-lg font-semibold text-center min-h-[60px]">
      &copy; {new Date().getFullYear()} JiKl-coding - {t.footer.rights}
    </footer>
  );
};

export default Footer;
