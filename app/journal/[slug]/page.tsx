import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import { getPostBySlug, getPosts, getSiteSettings } from '@/lib/site-content';

type JournalPostPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export async function generateStaticParams() {
  const posts = await getPosts();
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: JournalPostPageProps): Promise<Metadata> {
  try {
    const [{ slug }, settings] = await Promise.all([params, getSiteSettings()]);
    const post = await getPostBySlug(slug);

    return {
      title: post.title,
      description: post.excerpt,
      openGraph: {
        title: post.title,
        description: post.excerpt,
        images: [
          {
            url: post.coverImage || settings.ogImage,
            width: 1200,
            height: 630,
            alt: post.title,
          },
        ],
      },
    };
  } catch {
    return {};
  }
}

export default async function JournalPostPage({ params }: JournalPostPageProps) {
  const { slug } = await params;
  const post = await getPostBySlug(slug).catch(() => null);

  if (!post) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-[#0d1f14] px-4 py-10 text-cream sm:px-6 sm:py-16">
      <div className="mx-auto flex max-w-4xl flex-col gap-8">
        <Link href="/" className="text-sm uppercase tracking-[0.25em] text-[#DB612D]">
          Back to home
        </Link>

        <div className="space-y-4">
          <p className="text-xs uppercase tracking-[0.3em] text-[#DB612D]">{post.meta}</p>
          <h1 className="text-4xl font-bold leading-tight sm:text-6xl">{post.title}</h1>
          <p className="max-w-2xl text-base text-cream/70 sm:text-lg">{post.excerpt}</p>
        </div>

        <div className="relative h-[40vh] overflow-hidden rounded-3xl sm:h-[56vh]">
          <Image src={post.coverImage} alt={post.title} fill className="object-cover" sizes="100vw" />
        </div>

        <article className="max-w-3xl space-y-6 text-base leading-8 text-cream/85 sm:text-lg">
          <ReactMarkdown
            components={{
              h2: ({ children }) => <h2 className="pt-6 text-2xl font-semibold text-white">{children}</h2>,
              p: ({ children }) => <p>{children}</p>,
            }}
          >
            {post.body}
          </ReactMarkdown>
        </article>
      </div>
    </main>
  );
}
