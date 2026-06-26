import type { CitationModuleId } from '@/lib/legal-citations';
import { legalCitationBlocks } from '@/lib/legal-citations';

type LegalCitationBlockProps = {
  moduleId: CitationModuleId;
};

export function LegalCitationBlock({ moduleId }: LegalCitationBlockProps) {
  const block = legalCitationBlocks[moduleId];

  return (
    <aside className="bg-card border border-border rounded-xl p-5 mb-8">
      <div className="flex items-start justify-between gap-4 flex-wrap mb-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">Legal source map</p>
          <h2 className="text-lg font-semibold text-foreground">{block.title}</h2>
        </div>
        <a href="/docs/guides/legal-sources-governance" className="text-sm text-primary hover:underline">
          Governance guide
        </a>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div>
          <h3 className="text-sm font-semibold text-foreground mb-2">References</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            {block.references.map((reference) => (
              <li key={`${reference.label}-${reference.detail}`}>
                <a href={reference.href} target="_blank" rel="noreferrer" className="text-primary hover:underline">
                  {reference.label}
                </a>
                <span className="block">{reference.detail}</span>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-foreground mb-2">Toolkit helps with</h3>
          <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
            {block.automates.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-foreground mb-2">Does not replace</h3>
          <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
            {block.doesNotReplace.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </div>
    </aside>
  );
}
