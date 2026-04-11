export const translations = {
  cs: {
    hero: {
      title: "Vítejte na JiKl-Coding",
      description:
        "Já jsem Jirka, programátor, sportovec, stoik a člověk, co se nikdy nevzdává – ani na tréninku.",
    },
    about: {
      title: "O mně",
      description:
        "Vyvíjím podnikovou aplikaci pro pojišťovnu v prostředí Progress OpenEdge (ABL). Ve volném čase ale rád tvořím moderní webové stránky, vymýšlím zajímavé desgigny, a neustále se učím nové technologie – aktuálně se zaměřuji na Next.js, Tailwind a TypeScript. Mimo CS se věnuji především sportu a hudbě, studuji stoicismus a starám se o svého pejska. V případě zájmu mě kontaktujte a můžeme se domluvit na spolupráci.",
    },
    nav: {
      me: "já",
      services: "služby",
      skills: "dovednosti",
      projects: "projekty",
      contact: "kontakt"
    },
    services: {
      title: "Služby",
      subtitle: "Co nabízím?",
      items: [
      "🛠️ Weby a design na míru – bez šablon",
      "🧑‍💻 Vlastní rozhraní pro správu obsahu",
      "🗄️ Napojení na databázi a backend (např. Supabase)",
      "🌐 Zajištění hostingu (Vercel) a správa domény",
      "⚙️ Základní SEO a optimalizace výkonu",
      "🎨 Vlastní ikony a UI prvky",
      "🔄 Dlouhodobá správa webu dle dohody",
      "📞 Úvodní konzultace zdarma"
    ],
      contactNote: "Sídlím v Praze, spolupráci však nabízím i plně na dálku. V případě zájmu mě prosím kontaktujte – rád s Vámi nezávazně prodiskutuji Vaše potřeby."
    },
    projects: {
      calorinator: {
        description: "Webová aplikace pro sledování kalorií a správu jídelníčku. Umožňuje evidovat jídla, zakládat šablony, prohlížet databázi potravin a exportovat data do PDF. Obsahuje uživatelské účty a administrátorský panel.",
        stack: "Next.js, React, Tailwind CSS, TypeScript, Supabase, Prisma...",
      },
      troja: {
        description: "Webová stránka pražského fotbalového klubu TJ Sokol Troja, kterou jsem napsal se svým kamarádem Tadeášem. Disponuje vlastním adminem pro správu dat a psaní článků.",
        stack: "Next.js, React, Tailwind CSS, TypeScript, Supabase, Prisma...",
      },
      jindrich: {
        description: "Webová stránka vynikajícího umělce Jindry Voseckého napsaná v JS, HTML a CSS.",
        stack: "HTML, CSS, Vanilla JS, jQuery...",
      },
      cookbook: {
        description: "Moje webová kuchařka napsaná jako projekt pro radost. Rád totiž vařím.",
        stack: "HTML, CSS, Vanilla JS...",
      },
      valerie: {
        description: "Webová stránka výživářky a fitness trenérky Valerie, prezentující její služby.",
        stack: "Next.js, React, Tailwind CSS, TypeScript...",
      }
    },
    contact: "kontakt",
    footer: {
      rights: "Všechna práva vyhrazena.",
      terms: "Obchodní podmínky",
      cookies: "Tato stránka nevyužívá soubory cookies",
      address: "Sídlo",
      tradeRegister: "Zapsán v živnostenském rejstříku vedeném ÚMČ Praha 13",
      vat: "Nejsem plátcem DPH",
    },
  },
  en: {
    hero: {
      title: "Welcome to JiKl-Coding",
      description:
        "I'm Jirka – programmer, athlete, stoic, and someone who never gives up – not even during a workout.",
    },
    about: {
      title: "About Me",
      description:
        "I develop an enterprise application for an insurance company using Progress OpenEdge (ABL). In my free time, I enjoy creating modern websites, coming up with interesting designs, and continuously learning new technologies – currently focusing on Next.js, Tailwind, and TypeScript. Outside of computer science, I dedicate myself mainly to sports and music, I study stoicism, and take care of my dog. If you're interested, feel free to contact me and we can discuss working together."
    },
    nav: {
      me: "me",
      services: "services",
      skills: "skills",
      projects: "projects",
      contact: "contact"
    },
    services: {
    title: "Services",
    subtitle: "What I offer?",
    items: [
      "🛠️ Custom websites and design – no templates",
      "🧑‍💻 Admin interface for content management",
      "🗄️ Database and backend integration (e.g. Supabase)",
      "🌐 Hosting setup (Vercel) and domain management",
      "⚙️ Basic SEO and performance tuning",
      "🎨 Custom icons and UI elements",
      "🔄 Ongoing site maintenance on request",
      "📞 Free consultation and project review"
    ],
    contactNote: "Based in Prague, but fully available for remote projects as well. If interested, feel free to get in touch – I will be happy to discuss your needs with you."
  },
    projects: {
      calorinator: {
        description: "A web app for calorie tracking and meal management. Users can log meals, create templates, browse a food database and export data to PDF. Includes user accounts and an admin panel.",
        stack: "Next.js, React, Tailwind CSS, TypeScript, Supabase, Prisma...",
      },
      troja: {
        description: "Website of the Prague football club TJ Sokol Troja, which I built with my friend Tadeáš. It has its own admin panel for managing data and publishing articles.",
        stack: "Next.js, React, Tailwind CSS, TypeScript, Supabase, Prisma...",
      },
      jindrich: {
        description: "Website of the great artist Jindřich Vosecký built using JS, HTML, and CSS.",
        stack: "HTML, CSS, Vanilla JS, jQuery...",
      },
      cookbook: {
        description: "My personal cooking website created as a fun project. I simply love to cook.",
        stack: "HTML, CSS, Vanilla JS...",
      },
      valerie: {
        description: "Website of the nutritionist and fitness trainer Valerie, showcasing her services.",
        stack: "Next.js, React, Tailwind CSS, TypeScript...",
      }
    },
    contact: "contact",
    footer: {
      rights: "All rights reserved.",
      terms: "Terms of Service",
      cookies: "This website does not use cookies",
      address: "Registered office",
      tradeRegister: "Registered in the Trade Register maintained by Prague 13 District Office",
      vat: "Not a VAT payer",
    },
  },
} as const;
