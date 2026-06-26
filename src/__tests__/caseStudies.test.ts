import { APPROVED_CASE_STUDIES, CASE_STUDIES } from '@/lib/case-studies';
import { USED_BY } from '@/components/site/used-by-data';

describe('case study proof assets', () => {
  it('ships at least two approved case studies with required proof fields', () => {
    expect(APPROVED_CASE_STUDIES.length).toBeGreaterThanOrEqual(2);

    for (const study of APPROVED_CASE_STUDIES) {
      expect(study.slug).toMatch(/^[a-z0-9-]+$/);
      expect(study.organization).toBeTruthy();
      expect(study.problem).toBeTruthy();
      expect(study.implementation).toBeTruthy();
      expect(study.modulesUsed.length).toBeGreaterThan(0);
      expect(study.outcome).toBeTruthy();
      expect(study.consentToPublish.toLowerCase()).toContain('approved');
    }
  });

  it('keeps Used By case-study links backed by approved proof assets', () => {
    const approvedSlugs = new Set(APPROVED_CASE_STUDIES.map((study) => study.slug));

    for (const entry of USED_BY.filter((item) => item.caseStudySlug)) {
      expect(approvedSlugs.has(entry.caseStudySlug as string)).toBe(true);
      expect(entry.href).toBe(`/case-studies#${entry.caseStudySlug}`);
    }
  });

  it('keeps the future case study template unpublished', () => {
    const template = CASE_STUDIES.find((study) => study.slug === 'future-case-study-template');

    expect(template?.status).toBe('draft-template');
    expect(APPROVED_CASE_STUDIES.some((study) => study.slug === 'future-case-study-template')).toBe(false);
  });
});
