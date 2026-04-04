import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Blog — NDPA Toolkit',
  description: 'Insights on Nigeria data protection compliance, the NDPA 2023, and developer tooling for building compliant applications.',
};

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        {children}
      </div>
    </div>
  );
}
