import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const migrationDirectory = path.join(
  root,
  'packages/ndpr-recipes/migrations/0.3.0',
);
const standalonePath = path.join(migrationDirectory, 'postgresql.sql');
const drizzlePath = path.join(migrationDirectory, 'drizzle.sql');
const derivationPath = path.join(migrationDirectory, 'derive-drizzle.mjs');
const guidePath = path.join(migrationDirectory, 'README.md');
const packagePath = path.join(root, 'packages/ndpr-recipes/package.json');
const packageReadmePath = path.join(root, 'packages/ndpr-recipes/README.md');

const normalizeNewlines = (value: string) => value.replace(/\r\n/g, '\n');
const exactStatementCount = (sql: string, statement: 'BEGIN;' | 'COMMIT;') =>
  normalizeNewlines(sql)
    .split('\n')
    .filter((line) => line === statement).length;

function removeStandaloneTransaction(sql: string): string {
  const lines = normalizeNewlines(sql).split('\n');
  const beginIndex = lines.findIndex((line) => line === 'BEGIN;');
  const commitIndex = lines.findIndex((line) => line === 'COMMIT;');

  expect(exactStatementCount(sql, 'BEGIN;')).toBe(1);
  expect(exactStatementCount(sql, 'COMMIT;')).toBe(1);
  expect(beginIndex).toBeGreaterThanOrEqual(0);
  expect(commitIndex).toBeGreaterThan(beginIndex);
  expect(lines.slice(commitIndex + 1).every((line) => line.trim() === '')).toBe(true);

  return lines
    .filter((_, index) => index !== beginIndex && index !== commitIndex)
    .join('\n');
}

describe('ndpr-recipes 0.3.0 migration contract', () => {
  const standalone = fs.readFileSync(standalonePath, 'utf8');
  const drizzle = fs.readFileSync(drizzlePath, 'utf8');
  const derivation = fs.readFileSync(derivationPath, 'utf8');
  const guide = fs.readFileSync(guidePath, 'utf8');
  const packageReadme = fs.readFileSync(packageReadmePath, 'utf8');
  const recipePackage = JSON.parse(fs.readFileSync(packagePath, 'utf8')) as {
    files?: string[];
  };
  const migrations = [
    ['standalone/Prisma', standalone],
    ['Drizzle managed', drizzle],
  ] as const;

  it('publishes both runner-specific SQL artifacts and their deterministic derivation', () => {
    expect(recipePackage.files).toContain('migrations/**/*');
    expect(fs.existsSync(standalonePath)).toBe(true);
    expect(fs.existsSync(drizzlePath)).toBe(true);
    expect(fs.existsSync(derivationPath)).toBe(true);
    expect(packageReadme).toContain('`migrations/0.3.0/postgresql.sql`');
    expect(packageReadme).toContain('`migrations/0.3.0/drizzle.sql`');
    expect(packageReadme).toContain('`migrations/0.3.0/derive-drizzle.mjs`');
  });

  it('keeps one standalone wrapper and gives Drizzle the identical unwrapped body', () => {
    expect(exactStatementCount(standalone, 'BEGIN;')).toBe(1);
    expect(exactStatementCount(standalone, 'COMMIT;')).toBe(1);
    expect(exactStatementCount(drizzle, 'BEGIN;')).toBe(0);
    expect(exactStatementCount(drizzle, 'COMMIT;')).toBe(0);
    expect(normalizeNewlines(drizzle)).toBe(removeStandaloneTransaction(standalone));

    expect(derivation).toContain("new URL('./postgresql.sql', import.meta.url)");
    expect(derivation).toContain("new URL('./drizzle.sql', import.meta.url)");
    expect(derivation).toMatch(/index !== beginIndex && index !== commitIndex/);
    expect(derivation).toContain("process.argv.includes('--check')");
  });

  it.each(migrations)(
    '%s SQL has one tenant guard, the advisory lock, and every hard invariant',
    (_label, migration) => {
      expect(migration.match(/__REPLACE_WITH_TENANT_ID__/g)).toHaveLength(1);
      expect(migration).toMatch(
        /^-- @tantainnovative\/ndpr-recipes 0\.1\.x \/ published 0\.2\.0 -> 0\.3\.0/m,
      );
      expect(migration).toMatch(
        /SELECT pg_advisory_xact_lock\(hashtext\('ndpr-recipes-0\.3\.0-hardening'\)\);/,
      );
      expect(migration).toMatch(/legacy Prisma \(camel-case columns\)/);
      expect(migration).toMatch(/legacy Drizzle \(snake-case columns\)/);
      expect(migration).toMatch(
        /row_number\(\) OVER[\s\S]*PARTITION BY tenant_id, subject_id/,
      );
      expect(migration).toMatch(/active_subject_key = CASE/);
      expect(migration).toContain(
        "'[' || to_json(tenant_id)::text || ',' || to_json(subject_id)::text || ']'",
      );
      expect(migration).toMatch(
        /subject_id = COALESCE\(subject_id, 'legacy_dsr_' \|\| id\)/,
      );
      expect(migration).toMatch(/record_data stays NULL/);
      expect(migration).toMatch(/breach_notifications_requiring_evidence/);
      expect(migration).toMatch(/Consent tenant\/interaction backfill is incomplete/);
      expect(migration).toMatch(/More than one active consent row remains/);
      expect(migration).toMatch(
        /Consent active-subject keys do not match revocation state/,
      );
      expect(migration).toMatch(/DSR tenant\/subject backfill is incomplete/);
    },
  );

  it('binds standalone/Prisma and Drizzle commands to the correct files', () => {
    const prismaSection = guide.match(
      /## Prisma deployment([\s\S]*?)## Drizzle deployment/,
    )?.[1];
    const drizzleSection = guide.match(
      /## Drizzle deployment([\s\S]*?)## Standalone psql deployment or rehearsal/,
    )?.[1];
    const psqlSection = guide.match(
      /## Standalone psql deployment or rehearsal([\s\S]*?)## What the automated backfill does/,
    )?.[1];

    expect(prismaSection).toBeDefined();
    expect(prismaSection).toMatch(
      /cp node_modules\/@tantainnovative\/ndpr-recipes\/migrations\/0\.3\.0\/postgresql\.sql[\s\S]*prisma\/migrations\/202607180001_ndpr_recipes_0_3_hardening\/migration\.sql/,
    );
    expect(prismaSection).not.toMatch(/^cp .*drizzle\.sql/m);

    expect(drizzleSection).toBeDefined();
    expect(drizzleSection).toContain('DRIZZLE_MIGRATION_SQL=');
    expect(drizzleSection).toMatch(
      /cp node_modules\/@tantainnovative\/ndpr-recipes\/migrations\/0\.3\.0\/drizzle\.sql[\s\S]*"\$DRIZZLE_MIGRATION_SQL"/,
    );
    expect(drizzleSection).not.toMatch(/^cp .*postgresql\.sql/m);
    expect(drizzleSection).toMatch(/never add or nest top-level `BEGIN;`\/`COMMIT;`/);
    expect(drizzleSection).toMatch(/ledger insertion atomically/);

    expect(psqlSection).toBeDefined();
    expect(psqlSection).toMatch(
      /-f node_modules\/@tantainnovative\/ndpr-recipes\/migrations\/0\.3\.0\/postgresql\.sql/,
    );
    expect(guide).toContain(
      'node packages/ndpr-recipes/migrations/0.3.0/derive-drizzle.mjs --check',
    );
    expect(guide).toMatch(/Never concatenate them or nest transaction control/);

    expect(packageReadme).toMatch(
      /standalone psql and Prisma copy the wrapped \[`migrations\/0\.3\.0\/postgresql\.sql`\]/,
    );
    expect(packageReadme).toMatch(
      /Drizzle-managed migration copies only the transaction-control-free \[`migrations\/0\.3\.0\/drizzle\.sql`\]/,
    );
  });

  it('retains mapping, verification, deployment-order, and rollback guidance', () => {
    expect(guide).toMatch(/Do not run `prisma db push` or `drizzle-kit push`/);
    expect(guide).toMatch(/Export a DSR subject map/);
    expect(guide).toMatch(/validateProcessingRecord/);
    expect(guide).toMatch(/Review queues should be zero/);
    expect(guide).toMatch(/## Deployment order/);
    expect(guide).toMatch(/## Rollback/);
    expect(guide).toMatch(/restore the tested pre-migration snapshot/);
  });
});
