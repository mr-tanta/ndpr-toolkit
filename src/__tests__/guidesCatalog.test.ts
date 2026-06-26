import { guides } from '@/app/docs/guides/page';

describe('guides catalog', () => {
  it('includes the legal sources and update governance guide', () => {
    expect(guides).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          title: 'Legal Sources & Update Governance',
          href: '/docs/guides/legal-sources-governance',
          category: 'Trust',
        }),
      ]),
    );
  });
});
