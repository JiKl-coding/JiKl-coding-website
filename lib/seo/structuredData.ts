export function getPersonStructuredData(locale: "cs" | "en") {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    "name": "Jiří Klatovský",
    "jobTitle":
      locale === "cs" ? "Webový vývojář a programátor" : "Web developer and software engineer",
    "url": "https://jikl-coding.com",
    "image": "https://jikl-coding.com/og-image.png",
    "worksFor": {
      "@type": "Organization",
      "name": "JiKl-Coding",
    },
    "sameAs": [
      "https://github.com/JiKl-coding",
      "https://www.linkedin.com/in/jiří-klatovský-8605417b/",
    ],
    "description":
      locale === "cs"
        ? "Jsem Jiří Klatovský – vývojář moderních webových stránek a aplikací na míru v Reactu, Next.js, Tailwind CSS a Supabase."
        : "I'm Jiří Klatovský – developer of modern websites and custom web applications using React, Next.js, Tailwind CSS and Supabase.",
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Prague",
      "addressCountry": "CZ",
    },
  };
}
