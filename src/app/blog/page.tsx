import Link from 'next/link';
import { getAllPosts } from '@/lib/blog';
import { BookOpen, Clipboard, Package, TrendUp, Tag, ArrowRight } from '@phosphor-icons/react/dist/ssr';

export const metadata = {
  title: 'Blog | NDPA Toolkit',
  description: 'Insights on Nigeria Data Protection compliance, NDPA 2023 updates, NDPC guidance, and developer tooling.',
};

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-NG', { year: 'numeric', month: 'short', day: 'numeric' });
}

export default function BlogPage() {
  const posts = getAllPosts();
  const featured = posts[0];
  const feed = posts.slice(1);

  // Extract all unique tags for the sidebar
  const allTags = Array.from(new Set(posts.flatMap((p) => p.tags))).slice(0, 12);

  // Top 5 posts for "Trending" sidebar
  const trending = posts.slice(0, 5);

  return (
    <div>
      {/* Header */}
      <div className="blog-header">
        <h1 className="blog-title">Blog</h1>
        <p className="blog-subtitle">
          Insights on Nigeria data protection compliance, NDPA 2023 updates, and developer tooling.
        </p>
      </div>

      {/* Medium-style 2-column layout */}
      <div className="blog-layout">
        {/* ── Main feed (left) ── */}
        <div className="blog-feed">
          {/* Featured post */}
          {featured && (
            <Link href={`/blog/${featured.slug}`} className="blog-featured">
              <span className="blog-featured-label">Latest</span>
              <h2 className="blog-featured-title">{featured.title}</h2>
              <p className="blog-featured-desc">{featured.description}</p>
              <div className="blog-post-footer">
                <div className="blog-post-meta">
                  <div className="blog-avatar-sm">{featured.author.split(' ').map(n => n[0]).join('')}</div>
                  <span className="blog-author-name">{featured.author}</span>
                  <span className="blog-dot">&middot;</span>
                  <time dateTime={featured.date}>{formatDate(featured.date)}</time>
                  <span className="blog-dot">&middot;</span>
                  <span>{featured.readingTime}</span>
                </div>
                <div className="blog-tags-inline">
                  {featured.tags.slice(0, 2).map((tag) => (
                    <span key={tag} className="blog-tag">{tag}</span>
                  ))}
                </div>
              </div>
            </Link>
          )}

          {/* Divider */}
          {feed.length > 0 && <div className="blog-divider" />}

          {/* Feed posts */}
          {feed.map((post) => (
            <article key={post.slug} className="blog-feed-item">
              <Link href={`/blog/${post.slug}`} className="blog-feed-link">
                <div className="blog-feed-content">
                  <div className="blog-post-meta blog-post-meta-sm">
                    <div className="blog-avatar-xs">{post.author.split(' ').map(n => n[0]).join('')}</div>
                    <span className="blog-author-name-sm">{post.author}</span>
                  </div>
                  <h3 className="blog-feed-title">{post.title}</h3>
                  <p className="blog-feed-desc">{post.description}</p>
                  <div className="blog-post-footer">
                    <div className="blog-post-meta">
                      <time dateTime={post.date}>{formatDate(post.date)}</time>
                      <span className="blog-dot">&middot;</span>
                      <span>{post.readingTime}</span>
                    </div>
                    <div className="blog-tags-inline">
                      {post.tags.slice(0, 2).map((tag) => (
                        <span key={tag} className="blog-tag">{tag}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </Link>
            </article>
          ))}

          {posts.length === 0 && (
            <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 'var(--space-20) 0' }}>
              No posts yet. Check back soon.
            </p>
          )}
        </div>

        {/* ── Sidebar (right) ── */}
        <aside className="blog-sidebar">
          <div className="blog-sidebar-inner">
            {/* Trending */}
            <div className="blog-sidebar-section">
              <h3 className="blog-sidebar-heading">
                <TrendUp size={16} weight="bold" />
                Trending
              </h3>
              <div className="blog-trending-list">
                {trending.map((post, i) => (
                  <Link key={post.slug} href={`/blog/${post.slug}`} className="blog-trending-item">
                    <span className="blog-trending-num">{String(i + 1).padStart(2, '0')}</span>
                    <div>
                      <p className="blog-trending-title">{post.title}</p>
                      <span className="blog-trending-meta">{formatDate(post.date)} &middot; {post.readingTime}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Topics */}
            <div className="blog-sidebar-section">
              <h3 className="blog-sidebar-heading">
                <Tag size={16} weight="bold" />
                Topics
              </h3>
              <div className="blog-topics">
                {allTags.map((tag) => (
                  <span key={tag} className="blog-topic-chip">{tag}</span>
                ))}
              </div>
            </div>

            {/* Toolkit links */}
            <div className="blog-sidebar-section">
              <h3 className="blog-sidebar-heading">Explore</h3>
              {[
                { href: '/docs', icon: <BookOpen size={16} weight="duotone" />, label: 'Documentation' },
                { href: '/ndpr-demos', icon: <Clipboard size={16} weight="duotone" />, label: 'Live Demos' },
                { href: 'https://www.npmjs.com/package/@tantainnovative/ndpr-toolkit', icon: <Package size={16} weight="duotone" />, label: 'npm Package', external: true },
              ].map((item) => {
                const Tag = item.external ? 'a' : Link;
                const extra = item.external ? { target: '_blank' as const, rel: 'noopener noreferrer' } : {};
                return (
                  <Tag key={item.label} href={item.href} className="blog-sidebar-link" {...extra}>
                    <span className="blog-sidebar-link-icon">{item.icon}</span>
                    <span>{item.label}</span>
                    <ArrowRight size={12} weight="bold" className="blog-sidebar-link-arrow" />
                  </Tag>
                );
              })}
            </div>
          </div>
        </aside>
      </div>

      <style>{`
        /* ── Header ── */
        .blog-header {
          margin-bottom: var(--space-10);
          padding-bottom: var(--space-8);
          border-bottom: 1px solid var(--border-default);
        }
        .blog-title {
          font-size: clamp(2rem, 5vw, 2.75rem);
          font-weight: 800;
          color: var(--text-primary);
          letter-spacing: -0.03em;
          margin: 0;
        }
        .blog-subtitle {
          font-size: var(--text-lg);
          color: var(--text-secondary);
          margin: var(--space-2) 0 0 0;
          line-height: var(--leading-relaxed);
        }

        /* ── 2-column layout ── */
        .blog-layout {
          display: grid;
          grid-template-columns: 1fr 18rem;
          gap: var(--space-10);
          align-items: start;
        }
        @media (max-width: 900px) {
          .blog-layout { grid-template-columns: 1fr; }
          .blog-sidebar { display: none; }
        }

        /* ── Feed ── */
        .blog-feed { min-width: 0; }
        .blog-divider {
          height: 1px;
          background: var(--border-default);
          margin: var(--space-2) 0;
        }

        /* ── Featured ── */
        .blog-featured {
          display: block;
          padding: var(--space-8);
          border-radius: var(--radius-2xl);
          background: linear-gradient(160deg, rgba(37, 99, 235, 0.05) 0%, var(--bg-surface) 40%);
          border: 1px solid rgba(37, 99, 235, 0.12);
          text-decoration: none;
          color: inherit;
          margin-bottom: var(--space-2);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .blog-featured:hover {
          border-color: rgba(37, 99, 235, 0.25);
          box-shadow: 0 0 40px rgba(37, 99, 235, 0.06), 0 12px 32px rgba(0, 0, 0, 0.12);
          transform: translateY(-2px);
        }
        .blog-featured-label {
          display: inline-block;
          font-size: 0.6875rem;
          font-weight: 600;
          padding: 0.1875rem 0.625rem;
          border-radius: var(--radius-full);
          background: rgba(37, 99, 235, 0.1);
          color: #60a5fa;
          border: 1px solid rgba(37, 99, 235, 0.12);
          margin-bottom: var(--space-4);
        }
        .blog-featured-title {
          font-size: var(--text-2xl);
          font-weight: 800;
          color: var(--text-primary);
          margin: 0 0 var(--space-3) 0;
          letter-spacing: -0.02em;
          line-height: var(--leading-tight);
        }
        .blog-featured:hover .blog-featured-title { color: #93c5fd; }
        .blog-featured-desc {
          font-size: var(--text-base);
          color: var(--text-secondary);
          margin: 0 0 var(--space-5) 0;
          line-height: var(--leading-relaxed);
        }

        /* ── Feed items ── */
        .blog-feed-item {
          border-bottom: 1px solid var(--border-default);
        }
        .blog-feed-item:last-child { border-bottom: none; }
        .blog-feed-link {
          display: block;
          padding: var(--space-6) 0;
          text-decoration: none;
          color: inherit;
          transition: opacity 0.15s ease;
        }
        .blog-feed-link:hover { opacity: 1; }
        .blog-feed-content { }
        .blog-feed-title {
          font-size: var(--text-xl);
          font-weight: 700;
          color: var(--text-primary);
          margin: var(--space-2) 0 var(--space-2) 0;
          line-height: var(--leading-snug);
          letter-spacing: -0.01em;
        }
        .blog-feed-link:hover .blog-feed-title { color: #60a5fa; }
        .blog-feed-desc {
          font-size: var(--text-sm);
          color: var(--text-muted);
          margin: 0 0 var(--space-3) 0;
          line-height: var(--leading-relaxed);
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        /* ── Shared post elements ── */
        .blog-post-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: var(--space-2);
        }
        .blog-post-meta {
          display: flex;
          align-items: center;
          gap: 0.375rem;
          font-size: var(--text-sm);
          color: var(--text-muted);
        }
        .blog-post-meta-sm { margin-bottom: 0; }
        .blog-dot { color: var(--text-muted); }
        .blog-avatar-sm {
          width: 1.5rem;
          height: 1.5rem;
          border-radius: var(--radius-full);
          background: linear-gradient(135deg, #1d4ed8, #3b82f6);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #fff;
          font-weight: 700;
          font-size: 0.5625rem;
          flex-shrink: 0;
        }
        .blog-avatar-xs {
          width: 1.25rem;
          height: 1.25rem;
          border-radius: var(--radius-full);
          background: linear-gradient(135deg, #1d4ed8, #3b82f6);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #fff;
          font-weight: 700;
          font-size: 0.5rem;
          flex-shrink: 0;
        }
        .blog-author-name {
          font-weight: 500;
          color: var(--text-secondary);
        }
        .blog-author-name-sm {
          font-weight: 500;
          font-size: var(--text-sm);
          color: var(--text-secondary);
        }
        .blog-tags-inline {
          display: flex;
          gap: 0.25rem;
        }
        .blog-tag {
          font-size: 0.6875rem;
          font-weight: 500;
          padding: 0.0625rem 0.5rem;
          border-radius: var(--radius-full);
          background: rgba(37, 99, 235, 0.06);
          color: #60a5fa;
        }

        /* ── Sidebar ── */
        .blog-sidebar {
          position: sticky;
          top: 5rem;
          align-self: start;
        }
        .blog-sidebar-inner {
          display: flex;
          flex-direction: column;
          gap: var(--space-8);
        }
        .blog-sidebar-section { }
        .blog-sidebar-heading {
          display: flex;
          align-items: center;
          gap: 0.375rem;
          font-size: 0.6875rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: var(--text-secondary);
          margin: 0 0 var(--space-4) 0;
        }

        /* Trending */
        .blog-trending-list {
          display: flex;
          flex-direction: column;
          gap: var(--space-1);
        }
        .blog-trending-item {
          display: flex;
          align-items: flex-start;
          gap: var(--space-3);
          padding: var(--space-2) 0;
          text-decoration: none;
          color: inherit;
          transition: opacity 0.15s ease;
        }
        .blog-trending-item:hover .blog-trending-title { color: #60a5fa; }
        .blog-trending-num {
          font-size: var(--text-2xl);
          font-weight: 800;
          color: var(--border-hover);
          line-height: 1;
          min-width: 1.75rem;
          font-variant-numeric: tabular-nums;
        }
        .blog-trending-title {
          font-size: var(--text-sm);
          font-weight: 600;
          color: var(--text-primary);
          margin: 0;
          line-height: var(--leading-snug);
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          transition: color 0.15s ease;
        }
        .blog-trending-meta {
          font-size: var(--text-xs);
          color: var(--text-muted);
          margin-top: 0.125rem;
          display: block;
        }

        /* Topics */
        .blog-topics {
          display: flex;
          flex-wrap: wrap;
          gap: 0.375rem;
        }
        .blog-topic-chip {
          font-size: var(--text-xs);
          font-weight: 500;
          padding: 0.25rem 0.75rem;
          border-radius: var(--radius-full);
          background: var(--bg-surface);
          color: var(--text-secondary);
          border: 1px solid var(--border-default);
          transition: all 0.15s ease;
          cursor: default;
        }
        .blog-topic-chip:hover {
          border-color: rgba(37, 99, 235, 0.2);
          color: #60a5fa;
          background: rgba(37, 99, 235, 0.04);
        }

        /* Sidebar links */
        .blog-sidebar-link {
          display: flex;
          align-items: center;
          gap: var(--space-3);
          padding: var(--space-2) 0;
          font-size: var(--text-sm);
          color: var(--text-muted);
          text-decoration: none;
          transition: color 0.15s ease;
        }
        .blog-sidebar-link:hover { color: #60a5fa; }
        .blog-sidebar-link-icon {
          width: 1.75rem;
          height: 1.75rem;
          border-radius: var(--radius-md);
          background: var(--bg-elevated);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--text-muted);
          flex-shrink: 0;
          transition: all 0.15s ease;
        }
        .blog-sidebar-link:hover .blog-sidebar-link-icon {
          background: rgba(37, 99, 235, 0.08);
          color: #60a5fa;
        }
        .blog-sidebar-link-arrow {
          margin-left: auto;
          opacity: 0;
          transition: opacity 0.15s ease, transform 0.15s ease;
        }
        .blog-sidebar-link:hover .blog-sidebar-link-arrow {
          opacity: 1;
          transform: translateX(2px);
        }
      `}</style>
    </div>
  );
}
