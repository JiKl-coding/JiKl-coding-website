import { readFile } from 'node:fs/promises';
import path from 'node:path';
import ReactMarkdown from 'react-markdown';
import { notFound } from 'next/navigation';

export default async function TermsOfServicePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (locale !== 'cs' && locale !== 'en') {
    notFound();
  }

  const filename = locale === 'cs' ? 'obchodni-podminky.md' : 'terms-of-service.md';

  const filePath = path.join(
    process.cwd(),
    'public',
    locale,
    'docs',
    filename,
  );

  const content = await readFile(filePath, 'utf8');

  return (
    <article className="prose dark:prose-invert max-w-3xl mx-auto px-4 py-12 mt-24">
      <ReactMarkdown>{content}</ReactMarkdown>
    </article>
  );
}