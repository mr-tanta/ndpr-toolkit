import { render, screen, within } from '@testing-library/react';
import { USED_BY, UsedBySection } from '../UsedBySection';

const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

describe('UsedBySection', () => {
  it('renders approved organisations with accessible links and logos', () => {
    render(<UsedBySection />);

    expect(USED_BY).toHaveLength(6);
    expect(screen.getByRole('heading', { name: /teams shipping ndpa compliance/i })).toBeTruthy();

    for (const entry of USED_BY) {
      expect(entry.approvedForPublicUse).toBe(true);
      expect(screen.getAllByText(entry.name).length).toBeGreaterThanOrEqual(1);
      expect(screen.getByText(entry.sector)).toBeTruthy();

      if (entry.href) {
        expect(
          screen
            .getByRole('link', { name: new RegExp(escapeRegExp(entry.name), 'i') })
            .getAttribute('href'),
        ).toBe(entry.href);
      }

      if (entry.caseStudySlug) {
        expect(screen.getAllByText('View implementation story').length).toBeGreaterThan(0);
      }

      if (entry.logo) {
        const logo = screen.getByAltText(`${entry.name} logo`);
        expect(logo).toBeTruthy();
      }
    }
  });

  it('renders entries without logo assets as text wordmarks', () => {
    render(<UsedBySection />);

    const ngtaxkitWordmark = screen.getAllByText('NGtaxkit')[0];
    const logoPlate = ngtaxkitWordmark.closest('div');
    expect(logoPlate).not.toBeNull();
    expect(within(logoPlate as HTMLElement).getByText('NGtaxkit')).toBeTruthy();
  });

  it('links to the proof assets index', () => {
    render(<UsedBySection />);

    expect(screen.getByRole('link', { name: /browse proof assets/i }).getAttribute('href')).toBe('/case-studies');
  });
});
