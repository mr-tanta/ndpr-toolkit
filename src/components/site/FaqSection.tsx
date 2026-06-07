import React from 'react';

export interface FaqItem {
  question: string;
  answer: string;
}

interface FaqSectionProps {
  faqs: FaqItem[];
  heading?: string;
}

/**
 * Renders an accessible FAQ block and the matching schema.org FAQPage JSON-LD
 * in one place, so the on-page answers and the structured data can never drift
 * apart. Server-rendered with native <details> — no client JS, fully indexable.
 */
export function FaqSection({ faqs, heading = 'Frequently asked questions' }: FaqSectionProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: { '@type': 'Answer', text: faq.answer },
    })),
  };

  return (
    <section className="border-t border-border pt-12 mt-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      <h2 className="text-2xl font-bold mb-6">{heading}</h2>
      <div className="space-y-3">
        {faqs.map((faq) => (
          <details
            key={faq.question}
            className="group rounded-lg border border-border bg-card/50 p-5"
          >
            <summary className="flex cursor-pointer items-center justify-between font-semibold text-foreground [&::-webkit-details-marker]:hidden">
              {faq.question}
              <span className="ml-4 text-muted-foreground transition-transform group-open:rotate-45">
                +
              </span>
            </summary>
            <p className="mt-3 leading-relaxed text-muted-foreground">{faq.answer}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
