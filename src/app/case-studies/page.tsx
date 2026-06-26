import type { Metadata } from 'next';
import Image from 'next/image';
import { SiteHeader } from '@/components/site/SiteHeader';
import { SiteFooter } from '@/components/site/SiteFooter';
import { APPROVED_CASE_STUDIES, CASE_STUDIES } from '@/lib/case-studies';

export const metadata: Metadata = {
  title: 'Case Studies & Implementation Stories | NDPA Toolkit',
  description:
    'Approved NDPA Toolkit proof assets: implementation stories, modules used, outcomes, and consent-to-publish status.',
  alternates: { canonical: '/case-studies' },
  openGraph: {
    title: 'Case Studies & Implementation Stories | NDPA Toolkit',
    description:
      'Approved proof assets for teams using NDPA Toolkit in real implementation workflows.',
    url: 'https://ndprtoolkit.com.ng/case-studies',
    siteName: 'NDPA Toolkit',
    images: [{ url: '/screenshots/hero.png', width: 1280, height: 800, alt: 'NDPA Toolkit' }],
    locale: 'en_NG',
    type: 'website',
  },
};

const template = CASE_STUDIES.find((study) => study.status === 'draft-template');

export default function CaseStudiesPage() {
  return (
    <>
      <SiteHeader />
      <main className="case-page">
        <section className="case-hero">
          <div className="case-shell">
            <p className="case-eyebrow">Proof assets</p>
            <h1>Case studies and implementation stories</h1>
            <p className="case-lede">
              Approved public examples of teams using NDPA Toolkit building blocks. Each story names
              the problem, implementation path, modules used, outcome, and consent-to-publish status.
            </p>
            <div className="case-note">
              These are product implementation stories, not legal opinions, compliance certifications,
              or regulator endorsements.
            </div>
          </div>
        </section>

        <section className="case-shell case-list" aria-label="Approved case studies">
          {APPROVED_CASE_STUDIES.map((study) => (
            <article className="case-card" id={study.slug} key={study.slug}>
              <div className="case-card-header">
                <div className="case-logo">
                  {study.logo ? (
                    <Image
                      src={study.logo.src}
                      alt={`${study.organization} logo`}
                      width={study.logo.width}
                      height={study.logo.height}
                    />
                  ) : (
                    <span>{study.organization}</span>
                  )}
                </div>
                <div>
                  <p className="case-sector">{study.sector}</p>
                  <h2>{study.organization}</h2>
                </div>
              </div>

              <p className="case-summary">{study.summary}</p>

              <div className="case-grid">
                <section>
                  <h3>Problem</h3>
                  <p>{study.problem}</p>
                </section>
                <section>
                  <h3>Implementation</h3>
                  <p>{study.implementation}</p>
                </section>
                <section>
                  <h3>Outcome</h3>
                  <p>{study.outcome}</p>
                </section>
                <section>
                  <h3>Consent status</h3>
                  <p>{study.consentToPublish}</p>
                </section>
              </div>

              <div className="case-modules">
                <h3>Modules used</h3>
                <div className="case-tags">
                  {study.modulesUsed.map((module) => (
                    <span key={module}>{module}</span>
                  ))}
                </div>
              </div>

              <div className="case-next">
                <strong>Next proof step:</strong> {study.nextStep}
              </div>
            </article>
          ))}
        </section>

        {template && (
          <section className="case-shell case-template" aria-label="Case study template">
            <p className="case-eyebrow">Future proof template</p>
            <h2>{template.organization}</h2>
            <p>{template.summary}</p>
            <div className="case-grid">
              <section>
                <h3>Problem</h3>
                <p>{template.problem}</p>
              </section>
              <section>
                <h3>Implementation</h3>
                <p>{template.implementation}</p>
              </section>
              <section>
                <h3>Outcome</h3>
                <p>{template.outcome}</p>
              </section>
              <section>
                <h3>Approval gate</h3>
                <p>{template.consentToPublish}</p>
              </section>
            </div>
          </section>
        )}
      </main>
      <SiteFooter />

      <style>{`
        .case-page {
          min-height: 100vh;
          background: var(--bg-primary);
          color: var(--text-primary);
        }
        .case-shell {
          max-width: 1120px;
          margin: 0 auto;
          padding-left: var(--space-6);
          padding-right: var(--space-6);
        }
        .case-hero {
          padding: var(--space-24) 0 var(--space-16);
          border-bottom: 1px solid var(--border-default);
          background: linear-gradient(180deg, rgba(37, 99, 235, 0.08), transparent);
        }
        .case-eyebrow,
        .case-sector {
          margin: 0 0 var(--space-3);
          font-size: var(--text-xs);
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: #60a5fa;
        }
        .case-hero h1 {
          max-width: 760px;
          margin: 0;
          font-size: clamp(2.25rem, 5vw, 4rem);
          line-height: 1.05;
          letter-spacing: -0.04em;
        }
        .case-lede {
          max-width: 720px;
          margin: var(--space-6) 0 0;
          color: var(--text-secondary);
          font-size: var(--text-lg);
          line-height: var(--leading-relaxed);
        }
        .case-note {
          max-width: 720px;
          margin-top: var(--space-6);
          padding: var(--space-4);
          border: 1px solid rgba(96, 165, 250, 0.22);
          border-radius: var(--radius-lg);
          background: rgba(37, 99, 235, 0.08);
          color: var(--text-secondary);
          font-size: var(--text-sm);
        }
        .case-list {
          display: grid;
          gap: var(--space-8);
          padding-top: var(--space-16);
          padding-bottom: var(--space-12);
        }
        .case-card,
        .case-template {
          border: 1px solid var(--border-default);
          border-radius: var(--radius-xl);
          background: var(--bg-surface);
          padding: var(--space-8);
        }
        .case-card {
          scroll-margin-top: 5rem;
        }
        .case-card-header {
          display: flex;
          align-items: center;
          gap: var(--space-5);
          margin-bottom: var(--space-6);
        }
        .case-logo {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 11rem;
          min-height: 4.5rem;
          padding: var(--space-3);
          border-radius: var(--radius-lg);
          background: #fff;
          color: #0a1120;
          font-weight: 800;
          flex-shrink: 0;
        }
        .case-logo img {
          max-width: 100%;
          height: auto;
          object-fit: contain;
        }
        .case-card h2,
        .case-template h2 {
          margin: 0;
          font-size: var(--text-2xl);
          letter-spacing: -0.02em;
        }
        .case-summary {
          max-width: 820px;
          color: var(--text-secondary);
          line-height: var(--leading-relaxed);
          margin-bottom: var(--space-8);
        }
        .case-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: var(--space-5);
        }
        .case-grid section {
          padding: var(--space-5);
          border: 1px solid var(--border-default);
          border-radius: var(--radius-lg);
          background: var(--bg-elevated);
        }
        .case-grid h3,
        .case-modules h3 {
          margin: 0 0 var(--space-2);
          font-size: var(--text-sm);
          color: var(--text-primary);
        }
        .case-grid p,
        .case-template p {
          margin: 0;
          color: var(--text-secondary);
          line-height: var(--leading-relaxed);
        }
        .case-modules {
          margin-top: var(--space-6);
        }
        .case-tags {
          display: flex;
          flex-wrap: wrap;
          gap: var(--space-2);
        }
        .case-tags span {
          padding: 0.3125rem 0.625rem;
          border: 1px solid rgba(96, 165, 250, 0.24);
          border-radius: var(--radius-full);
          background: rgba(37, 99, 235, 0.08);
          color: #bfdbfe;
          font-size: var(--text-xs);
          font-weight: 600;
        }
        .case-next {
          margin-top: var(--space-6);
          padding-top: var(--space-5);
          border-top: 1px solid var(--border-default);
          color: var(--text-secondary);
          line-height: var(--leading-relaxed);
        }
        .case-template {
          margin-bottom: var(--space-20);
        }
        .case-template > p {
          max-width: 720px;
          margin-bottom: var(--space-6);
        }
        @media (max-width: 760px) {
          .case-card,
          .case-template {
            padding: var(--space-5);
          }
          .case-card-header,
          .case-grid {
            grid-template-columns: 1fr;
          }
          .case-card-header {
            align-items: flex-start;
            flex-direction: column;
          }
          .case-logo {
            width: 100%;
          }
        }
      `}</style>
    </>
  );
}
