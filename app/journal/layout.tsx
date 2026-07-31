import BlogNav from '@/components/BlogNav';
import { getSiteSettings } from '@/lib/site-content';

export default async function JournalLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSiteSettings();

  return (
    <>
      <BlogNav settings={settings} />
      {children}
    </>
  );
}
