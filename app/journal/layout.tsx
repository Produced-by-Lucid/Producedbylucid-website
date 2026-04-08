import BlogNav from '@/components/BlogNav';

export default function JournalLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <BlogNav />
      {children}
    </>
  );
}
