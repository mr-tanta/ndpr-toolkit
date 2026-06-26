'use client';

type ImportRow = {
  packagePath: string;
  exports: string;
  useCase: string;
};

type ProductionReadinessBlockProps = {
  moduleName: string;
  importRows: ImportRow[];
  checklist: string[];
  backendNotes: string[];
  testingNotes: string[];
  commonMistakes: string[];
};

function ListCard({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="bg-card border border-border rounded-xl p-5">
      <h3 className="font-semibold text-foreground mb-3">{title}</h3>
      <ul className="space-y-2 text-sm text-muted-foreground leading-relaxed">
        {items.map((item) => (
          <li key={item} className="flex gap-2">
            <span className="text-primary" aria-hidden="true">
              &bull;
            </span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function ProductionReadinessBlock({
  moduleName,
  importRows,
  checklist,
  backendNotes,
  testingNotes,
  commonMistakes,
}: ProductionReadinessBlockProps) {
  return (
    <section id="production-readiness" className="mb-10">
      <h2 className="text-2xl font-bold text-foreground mt-12 mb-4">Production Readiness</h2>
      <p className="text-muted-foreground mb-4 leading-relaxed">
        Use this checklist when moving {moduleName} from demo mode into a customer-facing workflow. Pair the UI package
        with the source templates in <code className="text-foreground font-mono">@tantainnovative/ndpr-recipes</code> so
        validation, persistence, and audit behavior live in your own backend.
      </p>

      <div className="bg-card border border-border rounded-xl overflow-hidden mb-6">
        <div className="grid grid-cols-1 md:grid-cols-[1.15fr_1fr_1.4fr] border-b border-border bg-muted/30 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          <div className="p-3">Import path</div>
          <div className="p-3 md:border-l md:border-border">Use</div>
          <div className="p-3 md:border-l md:border-border">Production role</div>
        </div>
        {importRows.map((row) => (
          <div
            key={`${row.packagePath}-${row.exports}`}
            className="grid grid-cols-1 md:grid-cols-[1.15fr_1fr_1.4fr] border-b border-border last:border-b-0 text-sm"
          >
            <div className="p-3 font-mono text-foreground break-words">{row.packagePath}</div>
            <div className="p-3 md:border-l md:border-border text-foreground">{row.exports}</div>
            <div className="p-3 md:border-l md:border-border text-muted-foreground leading-relaxed">{row.useCase}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ListCard title="Implementation checklist" items={checklist} />
        <ListCard title="Backend notes" items={backendNotes} />
        <ListCard title="Testing notes" items={testingNotes} />
        <ListCard title="Common mistakes" items={commonMistakes} />
      </div>
    </section>
  );
}
