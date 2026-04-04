import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getAllPosts, getPostBySlug } from '@/lib/blog';
import { BlogMDX } from '@/components/blog/blog-mdx';

export async function generateStaticParams() {
  const posts = getAllPosts();
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return { title: 'Post Not Found' };

  return {
    title: `${post.title} | NDPA Toolkit Blog`,
    description: post.description,
    keywords: `NDPA, Nigeria Data Protection, NDPC, ${post.title}`,
    authors: [{ name: post.author }],
    openGraph: {
      title: `${post.title} | NDPA Toolkit Blog`,
      description: post.description,
      type: 'article',
      publishedTime: post.date,
      authors: [post.author],
      siteName: 'NDPA Toolkit',
      locale: 'en_US',
      images: [
        {
          url: '/og-image.png',
          width: 1200,
          height: 630,
          alt: `${post.title} - NDPA Toolkit Blog`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image' as const,
      title: `${post.title} | NDPA Toolkit Blog`,
      description: post.description,
      images: ['/og-image.png'],
    },
  };
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-NG', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();

  const allPosts = getAllPosts();
  const currentIndex = allPosts.findIndex((p) => p.slug === slug);
  const prevPost = currentIndex < allPosts.length - 1 ? allPosts[currentIndex + 1] : null;
  const nextPost = currentIndex > 0 ? allPosts[currentIndex - 1] : null;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    author: {
      '@type': 'Person',
      name: post.author,
      url: 'https://linkedin.com/in/mr-tanta',
    },
    publisher: {
      '@type': 'Organization',
      name: 'NDPA Toolkit',
      url: 'https://ndprtoolkit.com.ng',
    },
  };

  return (
    <article>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* Back link */}
      <Link
        href="/blog"
        className="inline-flex items-center text-sm text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors mb-8"
      >
        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        All Posts
      </Link>

      {/* Header */}
      <header className="mb-10">
        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-4">
          <time dateTime={post.date}>{formatDate(post.date)}</time>
          <span aria-hidden="true">&middot;</span>
          <span>{post.readingTime}</span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white leading-tight mb-4">
          {post.title}
        </h1>

        <p className="text-lg text-gray-600 dark:text-gray-300">
          {post.description}
        </p>

        <div className="flex items-center gap-4 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm">
            {post.author.split(' ').map(n => n[0]).join('')}
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900 dark:text-white">{post.author}</p>
            <div className="flex flex-wrap gap-2 mt-1">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-block px-2 py-0.5 text-xs font-medium bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 rounded"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="prose prose-lg dark:prose-invert max-w-none
        prose-headings:font-bold prose-headings:text-gray-900 dark:prose-headings:text-white
        prose-a:text-blue-600 dark:prose-a:text-blue-400
        prose-code:text-sm prose-code:bg-gray-100 dark:prose-code:bg-gray-800 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded
        prose-pre:bg-gray-900 prose-pre:text-gray-300
        prose-img:rounded-lg
      ">
        <BlogMDX source={post.content} />
      </div>

      {/* Post navigation */}
      <nav className="mt-16 pt-8 border-t border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {prevPost ? (
            <Link
              href={`/blog/${prevPost.slug}`}
              className="group p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700 transition-colors"
            >
              <span className="text-xs text-gray-500 dark:text-gray-400">Previous</span>
              <p className="text-sm font-medium text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 mt-1 line-clamp-1">
                {prevPost.title}
              </p>
            </Link>
          ) : <div />}
          {nextPost && (
            <Link
              href={`/blog/${nextPost.slug}`}
              className="group p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700 transition-colors text-right"
            >
              <span className="text-xs text-gray-500 dark:text-gray-400">Next</span>
              <p className="text-sm font-medium text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 mt-1 line-clamp-1">
                {nextPost.title}
              </p>
            </Link>
          )}
        </div>
      </nav>
    </article>
  );
}
