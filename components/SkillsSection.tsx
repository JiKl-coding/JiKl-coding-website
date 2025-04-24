import { SiNextdotjs, SiReact, SiTailwindcss, SiTypescript, SiSupabase, SiPython, SiJavascript, SiPostgresql } from 'react-icons/si';
import { FaMicrosoft } from 'react-icons/fa';

const techStack = [
  { name: 'Next.js', icon: <SiNextdotjs /> },
  { name: 'React', icon: <SiReact /> },
  { name: 'Tailwind CSS', icon: <SiTailwindcss /> },
  { name: 'TypeScript', icon: <SiTypescript /> },
  { name: 'JavaScript', icon: <SiJavascript /> },
  { name: 'Supabase', icon: <SiSupabase /> },
  { name: 'PostgreSQL', icon: <SiPostgresql /> },
  { name: 'Python', icon: <SiPython /> },
  { name: 'VBA', icon: <FaMicrosoft /> },
  { name: 'Progress ABL', icon: <span className="text-xl font-bold dark:text-white">ABL</span> },
];

export default function SkillsSection() {
  return (
    <section className="py-16 border rounded-sm border-[var(--foreground)]) scroll-mt-[120px]" id="skills">    
      <div className="max-w-7xl mx-auto px-4">
        <h2 className="text-3xl sm:text-4xl font-bold mb-6 underline text-center uppercase">Tech-stack</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {techStack.map((tech) => (
            <div
              key={tech.name}
              className="flex flex-col items-center justify-center p-4 rounded-xl shadow bg-white dark:bg-gray-800 hover:scale-105 transition-transform hover-wiggle select-none"
            >
              <div className="text-4xl mb-2 text-gray-800 dark:text-white">{tech.icon}</div>
              <span className="text-sm font-medium text-center text-gray-900 dark:text-white">{tech.name}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
