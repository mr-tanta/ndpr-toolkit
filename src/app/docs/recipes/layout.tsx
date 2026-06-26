import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Nigeria NDPA Recipes — Production Patterns for Nigerian Apps',
  description:
    'Production-tested recipes for common NDPA 2023 compliance patterns: ecommerce consent, newsletter opt-in, contact-form disclosures, careers/applicant data rights, and admin-side DSR management.',
  keywords:
    'Nigeria NDPA recipes, NDPA cookie consent ecommerce, NDPR newsletter consent Nigeria, NDPA contact form privacy notice, careers applicant rights NDPA, admin DSR management',
  alternates: { canonical: '/docs/recipes' },
  openGraph: {
    title: 'Nigeria NDPA Recipes — NDPA Toolkit',
    description:
      'Production-tested NDPA 2023 patterns: ecommerce consent, newsletter, contact forms, careers rights, admin DSR portal.',
    url: 'https://ndprtoolkit.com.ng/docs/recipes',
    siteName: 'NDPA Toolkit',
    locale: 'en_NG',
    type: 'website',
  },
};

export default function RecipesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
