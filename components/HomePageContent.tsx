import HeroSection from '@/components/HeroSection';
import ProjectCard from '@/components/ProjectCard';
import SkillsSection from '@/components/SkillsSection';
import ContactForm from '@/components/ContactForm';
import ServicesSection from './ServicesSection';
import { translations } from '@/lib/i18n';
type Translation = (typeof translations)[keyof typeof translations];

import jindrich from '@/public/projects/jindrichvosecky.webp';
import troja from '@/public/projects/trojafotbal.webp';
import cookbook from '@/public/projects/belamicookbook.webp';
import valerie from '@/public/projects/valeriewendlerova.webp';
import calorinator from '@/public/projects/calorinator.webp';

export default function HomePageContent({ t }: { t: Translation }) {
  const projects = [
    {
      label: 'calorinator.eu',
      image: calorinator,
      href: 'https://www.calorinator.eu',
      description: t.projects.calorinator.description,
      stackDesc: t.projects.calorinator.stack,
    },
    {
      label: 'trojafotbal.cz',
      image: troja,
      layout: false,
      href: 'https://www.trojafotbal.cz',
      description: t.projects.troja.description,
      stackDesc: t.projects.troja.stack,
    },
    {
      label: 'valeriefitness.cz',
      image: valerie,
      href: 'https://www.valeriefitness.cz/',
      description: t.projects.valerie.description,
      stackDesc: t.projects.valerie.stack,
    },
    {
      label: 'jindrichvosecky.com',
      image: jindrich,
      layout: false,
      href: 'https://www.jindrichvosecky.com',
      description: t.projects.jindrich.description,
      stackDesc: t.projects.jindrich.stack,
    },
    {
      label: 'belamicookbook.cz',
      image: cookbook,
      layout: false,
      href: 'https://www.belamicookbook.cz',
      description: t.projects.cookbook.description,
      stackDesc: t.projects.cookbook.stack,
    }
  ];

  const hiddenText = {
    cs: `Jsem Jiří Klatovský – webový vývojář, programátor a tvůrce aplikací na míru. Pomáhám firmám a jednotlivcům tvořit moderní weby v Reactu, Next.js, Tailwind CSS a Supabase. Nabízím vývoj na míru, přístupné weby, optimalizaci výkonu i integraci backendových řešení.`,
    en: `I'm Jiří Klatovský – web developer, programmer and creator of custom apps. I help businesses and individuals build modern websites using React, Next.js, Tailwind CSS and Supabase. I offer tailor-made development, accessible design, performance optimization and backend integrations.`,
  };

  return (
    <main className="max-w-7xl mx-auto flex flex-col items-center justify-center min-h-screen gap-64 px-1 mt-[150px]">
      <HeroSection />

      {/* Invisible SEO text */}
      <section aria-hidden="true" className="sr-only">
        <p>{hiddenText[t.nav.contact === 'kontakt' ? 'cs' : 'en']}</p>
      </section>

      <ServicesSection />

      <SkillsSection />

      <section
        id="projects"
        className="w-full scroll-mt-[120px] flex flex-col gap-24 justify-center items-center"
      >
        <h2 className="text-3xl sm:text-4xl font-bold underline text-center uppercase">
          {t.nav.projects}
        </h2>
        {projects.map((p) => (
          <ProjectCard key={p.label} {...p} />
        ))}
      </section>

      <ContactForm />
    </main>
  );
}
