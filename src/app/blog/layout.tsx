import type { Metadata } from 'next';
import { SiteHeader } from '@/components/site/SiteHeader';
import { SiteFooter } from '@/components/site/SiteFooter';

export const metadata: Metadata = {
  title: 'Blog | NDPA Toolkit',
  description:
    'Insights on Nigeria Data Protection compliance, NDPA 2023 updates, NDPC guidance, and developer tooling.',
  keywords:
    'NDPA blog, Nigeria Data Protection news, NDPC updates, data protection compliance articles',
  openGraph: {
    title: 'Blog | NDPA Toolkit',
    description:
      'Insights on Nigeria Data Protection compliance, NDPA 2023 updates, NDPC guidance, and developer tooling.',
    url: 'https://ndprtoolkit.com.ng/blog',
    siteName: 'NDPA Toolkit',
    images: [{ url: '/screenshots/hero.png', width: 1280, height: 800, alt: 'NDPA Toolkit Blog' }],
    locale: 'en_NG',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Blog | NDPA Toolkit',
    description:
      'Insights on Nigeria Data Protection compliance, NDPA 2023 updates, NDPC guidance, and developer tooling.',
    images: ['/screenshots/hero.png'],
  },
};

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SiteHeader />
      <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
        <div style={{ maxWidth: '72rem', margin: '0 auto', padding: 'var(--space-12) var(--space-6) var(--space-20)' }}>
          {children}
        </div>
      </div>
      <SiteFooter />
    </>
  );
}
