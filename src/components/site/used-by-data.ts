export interface UsedByEntry {
  name: string;
  sector: string;
  approvedForPublicUse: true;
  caseStudySlug?: string;
  logo?: {
    src: string;
    width: number;
    height: number;
  };
  href?: string;
}

export const USED_BY: UsedByEntry[] = [
  {
    name: 'Perkflow Inc',
    sector: 'Strategy & operations execution platform',
    approvedForPublicUse: true,
    logo: { src: '/logos/perkflow.svg', width: 180, height: 48 },
    href: 'https://perkflow.io',
  },
  {
    name: 'Finlab Nigeria',
    sector: 'Scientific & educational equipment',
    approvedForPublicUse: true,
    logo: { src: '/logos/finlab.webp', width: 180, height: 48 },
    caseStudySlug: 'finlab-nigeria-privacy-readiness',
    href: '/case-studies#finlab-nigeria-privacy-readiness',
  },
  {
    name: 'Burtech Products',
    sector: 'Laboratory, school & industrial equipment',
    approvedForPublicUse: true,
    logo: { src: '/logos/burtech.png', width: 180, height: 48 },
    href: 'https://burtechproducts.com',
  },
  {
    name: 'Chibek Instruments',
    sector: 'Laboratory & power instruments',
    approvedForPublicUse: true,
    logo: { src: '/logos/chibek.webp', width: 180, height: 48 },
    href: 'https://chibek.com',
  },
  {
    name: 'NGtaxkit',
    sector: 'Nigeria Tax Act 2025 compliance SDK',
    approvedForPublicUse: true,
  },
  {
    name: 'Tanta Innovative',
    sector: 'Software & technology consulting; maintainer of the toolkit',
    approvedForPublicUse: true,
    logo: { src: '/logos/tanta.png', width: 180, height: 48 },
    caseStudySlug: 'tanta-innovative-internal-compliance',
    href: '/case-studies#tanta-innovative-internal-compliance',
  },
];
