import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getAllPosts, getPostBySlug } from '@/lib/blog';
import { BlogMDX } from '@/components/blog/blog-mdx';

export async function generateStaticParams() {
  return getAllPosts().map((post) => ({ slug: post.slug }));
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
      images: [{ url: '/og-image.png', width: 1200, height: 630, alt: `${post.title}` }],
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
  return new Date(dateStr).toLocaleDateString('en-NG', { year: 'numeric', month: 'long', day: 'numeric' });
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
    author: { '@type': 'Person', name: post.author, url: 'https://linkedin.com/in/mr-tanta' },
    publisher: { '@type': 'Organization', name: 'NDPA Toolkit', url: 'https://ndprtoolkit.com.ng' },
  };

  return (
    <article>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* Back */}
      <Link href="/blog" className="blogpost-back">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5" /><path d="m12 19-7-7 7-7" /></svg>
        All Posts
      </Link>

      {/* Header */}
      <header className="blogpost-header">
        <div className="blogpost-meta">
          <time dateTime={post.date}>{formatDate(post.date)}</time>
          <span aria-hidden="true">&middot;</span>
          <span>{post.readingTime}</span>
        </div>
        <h1 className="blogpost-title">{post.title}</h1>
        <p className="blogpost-desc">{post.description}</p>
        <div className="blogpost-author">
          <div className="blogpost-avatar">
            {post.author.split(' ').map(n => n[0]).join('')}
          </div>
          <div>
            <p className="blogpost-author-name">{post.author}</p>
            <div className="blogpost-tags">
              {post.tags.map((tag) => (
                <span key={tag} className="blogpost-tag">{tag}</span>
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="blogpost-content">
        <BlogMDX source={post.content} />
      </div>

      {/* Navigation */}
      <nav className="blogpost-nav">
        {prevPost ? (
          <Link href={`/blog/${prevPost.slug}`} className="blogpost-nav-link">
            <span className="blogpost-nav-label">Previous</span>
            <p className="blogpost-nav-title">{prevPost.title}</p>
          </Link>
        ) : <div />}
        {nextPost ? (
          <Link href={`/blog/${nextPost.slug}`} className="blogpost-nav-link blogpost-nav-next">
            <span className="blogpost-nav-label">Next</span>
            <p className="blogpost-nav-title">{nextPost.title}</p>
          </Link>
        ) : null}
      </nav>

      <style>{`
        .blogpost-back {
          display: inline-flex;
          align-items: center;
          gap: 0.375rem;
          font-size: var(--text-sm);
          font-weight: 500;
          color: var(--text-muted);
          text-decoration: none;
          margin-bottom: var(--space-8);
          padding: 0.375rem 0.75rem;
          border-radius: var(--radius-md);
          transition: all 0.15s ease;
        }
        .blogpost-back:hover { color: #60a5fa; background: rgba(37, 99, 235, 0.06); }

        .blogpost-header {
          margin-bottom: var(--space-10);
          padding-bottom: var(--space-8);
          border-bottom: 1px solid var(--border-default);
        }
        .blogpost-meta {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: var(--text-sm);
          color: var(--text-muted);
          margin-bottom: var(--space-4);
        }
        .blogpost-title {
          font-size: clamp(1.75rem, 4vw, 2.5rem);
          font-weight: 800;
          color: var(--text-primary);
          line-height: var(--leading-tight);
          letter-spacing: -0.025em;
          margin: 0 0 var(--space-4) 0;
        }
        .blogpost-desc {
          font-size: var(--text-lg);
          color: var(--text-secondary);
          line-height: var(--leading-relaxed);
          margin: 0;
        }
        .blogpost-author {
          display: flex;
          align-items: center;
          gap: var(--space-3);
          margin-top: var(--space-6);
          padding-top: var(--space-6);
          border-top: 1px solid var(--border-default);
        }
        .blogpost-avatar {
          width: 2.5rem;
          height: 2.5rem;
          border-radius: var(--radius-full);
          background: linear-gradient(135deg, #1d4ed8, #3b82f6);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #fff;
          font-weight: 700;
          font-size: var(--text-sm);
          flex-shrink: 0;
        }
        .blogpost-author-name {
          font-size: var(--text-sm);
          font-weight: 600;
          color: var(--text-primary);
          margin: 0;
        }
        .blogpost-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 0.375rem;
          margin-top: 0.25rem;
        }
        .blogpost-tag {
          font-size: 0.6875rem;
          font-weight: 500;
          padding: 0.125rem 0.5rem;
          border-radius: var(--radius-full);
          background: rgba(37, 99, 235, 0.08);
          color: #60a5fa;
          border: 1px solid rgba(37, 99, 235, 0.1);
        }

        /* Content */
        .blogpost-content {
          font-size: var(--text-base);
          line-height: 1.8;
          color: var(--text-secondary);
        }

        /* Navigation */
        .blogpost-nav {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: var(--space-4);
          margin-top: var(--space-16);
          padding-top: var(--space-8);
          border-top: 1px solid var(--border-default);
        }
        @media (max-width: 640px) { .blogpost-nav { grid-template-columns: 1fr; } }
        .blogpost-nav-link {
          display: block;
          padding: var(--space-4);
          border-radius: var(--radius-lg);
          border: 1px solid var(--border-default);
          text-decoration: none;
          transition: all 0.2s ease;
        }
        .blogpost-nav-link:hover {
          border-color: rgba(37, 99, 235, 0.25);
          background: rgba(37, 99, 235, 0.03);
        }
        .blogpost-nav-next { text-align: right; }
        .blogpost-nav-label {
          font-size: var(--text-xs);
          color: var(--text-muted);
        }
        .blogpost-nav-title {
          font-size: var(--text-sm);
          font-weight: 600;
          color: var(--text-primary);
          margin: var(--space-1) 0 0 0;
          display: -webkit-box;
          -webkit-line-clamp: 1;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .blogpost-nav-link:hover .blogpost-nav-title { color: #60a5fa; }
      `}</style>
    </article>
  );
}
