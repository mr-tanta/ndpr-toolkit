import React from 'react';
import Image from 'next/image';
import { Section, Container, Grid, SiteButton, SiteCard } from '@/components/site/ui';
import { USED_BY } from './used-by-data';

export { USED_BY } from './used-by-data';

const styles = {
  cardBody: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--space-4)',
    padding: 'var(--space-2)',
    height: '100%',
  },
  logoPlate: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '72px',
    borderRadius: 'var(--radius-lg)',
    background: '#ffffff',
    padding: '0 var(--space-5)',
  },
  logo: {
    maxHeight: '40px',
    maxWidth: '100%',
    objectFit: 'contain',
  },
  wordmark: {
    fontSize: 'var(--text-lg)',
    fontWeight: 800,
    color: '#0a1120',
  },
  copy: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--space-1)',
  },
  name: {
    fontSize: 'var(--text-base)',
    fontWeight: 700,
    color: 'var(--text-primary)',
  },
  sector: {
    fontSize: 'var(--text-sm)',
    color: 'var(--text-secondary)',
    lineHeight: 'var(--leading-relaxed)',
  },
  proofLink: {
    fontSize: 'var(--text-xs)',
    color: '#60a5fa',
    fontWeight: 600,
    marginTop: 'var(--space-2)',
  },
  footer: {
    display: 'flex',
    justifyContent: 'center',
    marginTop: 'var(--space-8)',
  },
} satisfies Record<string, React.CSSProperties>;

export function UsedBySection() {
  return (
    <Section
      id="used-by"
      badge="Used by"
      title="Teams shipping NDPA compliance with the toolkit"
      subtitle="Organisations across Nigeria rely on the toolkit for consent, data subject rights, and audit-ready compliance."
    >
      <Container>
        <Grid cols={3} gap="md">
          {USED_BY.map((entry) => (
            <SiteCard key={entry.name} variant="default" href={entry.href}>
              <div style={styles.cardBody}>
                <div style={styles.logoPlate}>
                  {entry.logo ? (
                    <Image
                      src={entry.logo.src}
                      alt={`${entry.name} logo`}
                      width={entry.logo.width}
                      height={entry.logo.height}
                      style={styles.logo}
                    />
                  ) : (
                    <span style={styles.wordmark}>
                      {entry.name}
                    </span>
                  )}
                </div>

                <div style={styles.copy}>
                  <span style={styles.name}>
                    {entry.name}
                  </span>
                  <span style={styles.sector}>
                    {entry.sector}
                  </span>
                  {entry.caseStudySlug && (
                    <span style={styles.proofLink}>
                      View implementation story
                    </span>
                  )}
                </div>
              </div>
            </SiteCard>
          ))}
        </Grid>
        <div style={styles.footer}>
          <SiteButton variant="secondary" href="/case-studies">
            Browse proof assets
          </SiteButton>
        </div>
      </Container>
    </Section>
  );
}
