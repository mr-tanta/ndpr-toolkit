'use client';

import Link from 'next/link';
import { DocLayout } from '@/components/docs/DocLayout';

export default function AdaptersGuide() {
  return (
    <DocLayout
      title="Storage Adapters"
      description="Learn how adapters decouple your consent and DSR data from any specific storage backend"
    >
      <section id="introduction" className="mb-8">
        <h2 className="text-2xl font-bold text-foreground mt-12 mb-4">What Are Adapters?</h2>
        <p className="mb-4 text-foreground">
          In v3, every hook that reads or writes persistent data accepts an optional <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">adapter</code> prop.
          An adapter is a small object that implements the <strong>StorageAdapter</strong> interface — four methods that map to
          read, write, update, and delete operations.
        </p>
        <p className="mb-4 text-foreground">
          Because the adapter sits between the toolkit and your storage layer, you can swap backends without touching
          any of your component code. A team prototype might use <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">localStorageAdapter</code>; a production
          deployment can point the same components at a REST API adapter — zero component changes required.
        </p>
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 p-4 rounded-xl mb-4">
          <h4 className="text-blue-800 dark:text-blue-200 font-medium mb-2">Why This Matters for NDPA Compliance</h4>
          <p className="text-blue-700 dark:text-blue-300 text-sm">
            The NDPA 2023 requires organisations to demonstrate that consent records are accurate, timestamped, and auditable.
            Adapters make it straightforward to persist consent to a durable, queryable backend (e.g. a database) while keeping
            your UI layer clean and testable.
          </p>
        </div>
      </section>

      <section id="interface" className="mb-8">
        <h2 className="text-2xl font-bold text-foreground mt-12 mb-4">The StorageAdapter Interface</h2>
        <p className="mb-4 text-foreground">
          Every adapter must implement the following TypeScript interface, exported from{' '}
          <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">@tantainnovative/ndpr-toolkit</code>:
        </p>
        <div className="bg-card border border-border rounded-xl p-4 overflow-x-auto mb-4">
          <pre className="text-foreground"><code>{`export interface StorageAdapter<T = unknown> {
  /**
   * Read a value by key. Returns null if not found.
   */
  get(key: string): Promise<T | null>;

  /**
   * Write or overwrite a value by key.
   */
  set(key: string, value: T): Promise<void>;

  /**
   * Remove a value by key.
   */
  remove(key: string): Promise<void>;

  /**
   * Return all key–value pairs that belong to this adapter.
   * Used by the compliance score engine and audit utilities.
   */
  getAll(): Promise<Record<string, T>>;
}`}</code></pre>
        </div>
        <p className="mb-4 text-foreground">
          All methods are <strong>async</strong>. Even the built-in localStorage adapter wraps its synchronous calls in
          resolved promises so your application code is always consistent regardless of the underlying storage mechanism.
        </p>
      </section>

      <section id="built-in" className="mb-8">
        <h2 className="text-2xl font-bold text-foreground mt-12 mb-4">Built-in Adapters</h2>
        <p className="mb-4 text-foreground">
          The toolkit ships six ready-to-use adapters. Import them directly from the package:
        </p>
        <div className="bg-card border border-border rounded-xl p-4 overflow-x-auto mb-6">
          <pre className="text-foreground"><code>{`import {
  localStorageAdapter,
  sessionStorageAdapter,
  cookieAdapter,
  apiAdapter,
  memoryAdapter,
  composeAdapters,
} from '@tantainnovative/ndpr-toolkit';`}</code></pre>
        </div>

        <div className="overflow-x-auto mb-6">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-muted">
                <th className="border border-border px-4 py-2 text-left font-semibold text-foreground">Adapter</th>
                <th className="border border-border px-4 py-2 text-left font-semibold text-foreground">Storage</th>
                <th className="border border-border px-4 py-2 text-left font-semibold text-foreground">Best For</th>
                <th className="border border-border px-4 py-2 text-left font-semibold text-foreground">SSR Safe</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-border">
                <td className="border border-border px-4 py-2 font-mono text-foreground">localStorageAdapter</td>
                <td className="border border-border px-4 py-2 text-foreground">Window.localStorage</td>
                <td className="border border-border px-4 py-2 text-foreground">Prototypes, SPAs</td>
                <td className="border border-border px-4 py-2 text-foreground">Yes (no-ops on server)</td>
              </tr>
              <tr className="border-b border-border bg-muted/30">
                <td className="border border-border px-4 py-2 font-mono text-foreground">sessionStorageAdapter</td>
                <td className="border border-border px-4 py-2 text-foreground">Window.sessionStorage</td>
                <td className="border border-border px-4 py-2 text-foreground">Tab-scoped sessions</td>
                <td className="border border-border px-4 py-2 text-foreground">Yes (no-ops on server)</td>
              </tr>
              <tr className="border-b border-border">
                <td className="border border-border px-4 py-2 font-mono text-foreground">cookieAdapter</td>
                <td className="border border-border px-4 py-2 text-foreground">Browser cookies</td>
                <td className="border border-border px-4 py-2 text-foreground">Cross-tab, SSR access</td>
                <td className="border border-border px-4 py-2 text-foreground">Yes</td>
              </tr>
              <tr className="border-b border-border bg-muted/30">
                <td className="border border-border px-4 py-2 font-mono text-foreground">apiAdapter</td>
                <td className="border border-border px-4 py-2 text-foreground">REST API endpoint</td>
                <td className="border border-border px-4 py-2 text-foreground">Production, multi-device</td>
                <td className="border border-border px-4 py-2 text-foreground">Yes</td>
              </tr>
              <tr className="border-b border-border">
                <td className="border border-border px-4 py-2 font-mono text-foreground">memoryAdapter</td>
                <td className="border border-border px-4 py-2 text-foreground">In-memory Map</td>
                <td className="border border-border px-4 py-2 text-foreground">Testing, SSR fallback</td>
                <td className="border border-border px-4 py-2 text-foreground">Yes</td>
              </tr>
              <tr className="bg-muted/30">
                <td className="border border-border px-4 py-2 font-mono text-foreground">composeAdapters</td>
                <td className="border border-border px-4 py-2 text-foreground">Multiple (ordered)</td>
                <td className="border border-border px-4 py-2 text-foreground">Local cache + API sync</td>
                <td className="border border-border px-4 py-2 text-foreground">Yes</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section id="using-with-hooks" className="mb-8">
        <h2 className="text-2xl font-bold text-foreground mt-12 mb-4">Using Adapters with Hooks</h2>
        <p className="mb-4 text-foreground">
          Pass the adapter as a configuration option to any hook that supports it. Here is a minimal example using{' '}
          <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">useConsent</code>:
        </p>
        <div className="bg-card border border-border rounded-xl p-4 overflow-x-auto mb-4">
          <pre className="text-foreground"><code>{`import { useConsent, localStorageAdapter } from '@tantainnovative/ndpr-toolkit';

export function ConsentBanner() {
  const { consents, updateConsent, hasConsented } = useConsent({
    adapter: localStorageAdapter,
    storageKey: 'my-app-consents',
  });

  return (
    <div>
      <p>Analytics enabled: {hasConsented('analytics') ? 'Yes' : 'No'}</p>
      <button onClick={() => updateConsent('analytics', true)}>
        Accept Analytics
      </button>
    </div>
  );
}`}</code></pre>
        </div>

        <p className="mb-4 text-foreground">
          Swap to a production API adapter by changing a single line — your component stays the same:
        </p>
        <div className="bg-card border border-border rounded-xl p-4 overflow-x-auto mb-4">
          <pre className="text-foreground"><code>{`import { useConsent, apiAdapter } from '@tantainnovative/ndpr-toolkit';

const myApiAdapter = apiAdapter({
  baseUrl: '/api/consent',
  headers: { Authorization: 'Bearer ' + token },
});

export function ConsentBanner() {
  const { consents, updateConsent, hasConsented } = useConsent({
    adapter: myApiAdapter,
    storageKey: 'consent-v1',
  });
  // ...same component body
}`}</code></pre>
        </div>
      </section>

      <section id="custom-adapter" className="mb-8">
        <h2 className="text-2xl font-bold text-foreground mt-12 mb-4">Creating a Custom Adapter</h2>
        <p className="mb-4 text-foreground">
          Any object that satisfies the <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">StorageAdapter</code> interface works.
          The following example stores consent records in a Supabase table:
        </p>
        <div className="bg-card border border-border rounded-xl p-4 overflow-x-auto mb-4">
          <pre className="text-foreground"><code>{`import type { StorageAdapter } from '@tantainnovative/ndpr-toolkit';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export const supabaseConsentAdapter: StorageAdapter = {
  async get(key) {
    const { data } = await supabase
      .from('consent_records')
      .select('value')
      .eq('key', key)
      .single();
    return data?.value ?? null;
  },

  async set(key, value) {
    await supabase
      .from('consent_records')
      .upsert({ key, value, updated_at: new Date().toISOString() });
  },

  async remove(key) {
    await supabase.from('consent_records').delete().eq('key', key);
  },

  async getAll() {
    const { data } = await supabase.from('consent_records').select('key, value');
    return Object.fromEntries((data ?? []).map((r) => [r.key, r.value]));
  },
};`}</code></pre>
        </div>
        <p className="mb-4 text-foreground">
          Then use it anywhere you would pass a built-in adapter:
        </p>
        <div className="bg-card border border-border rounded-xl p-4 overflow-x-auto mb-4">
          <pre className="text-foreground"><code>{`const { consents } = useConsent({ adapter: supabaseConsentAdapter });`}</code></pre>
        </div>
      </section>

      <section id="compose-adapters" className="mb-8">
        <h2 className="text-2xl font-bold text-foreground mt-12 mb-4">The composeAdapters Pattern</h2>
        <p className="mb-4 text-foreground">
          <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">composeAdapters</code> chains multiple adapters so that reads come from the first available source and writes fan out
          to all layers. This is the recommended production pattern: serve reads from localStorage (fast, offline-capable)
          and sync writes to your API (durable, auditable).
        </p>
        <div className="bg-card border border-border rounded-xl p-4 overflow-x-auto mb-4">
          <pre className="text-foreground"><code>{`import {
  useConsent,
  composeAdapters,
  localStorageAdapter,
  apiAdapter,
} from '@tantainnovative/ndpr-toolkit';

const myApiAdapter = apiAdapter({ baseUrl: '/api/consent' });

// Reads: localStorage first (returns immediately if found, skips API)
// Writes: propagated to BOTH localStorage AND the API
const composedAdapter = composeAdapters([localStorageAdapter, myApiAdapter]);

export function ConsentBanner() {
  const { consents, updateConsent } = useConsent({
    adapter: composedAdapter,
  });
  // ...
}`}</code></pre>
        </div>

        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 p-4 rounded-xl mb-4">
          <h4 className="text-yellow-800 dark:text-yellow-200 font-medium mb-2">Order Matters</h4>
          <p className="text-yellow-700 dark:text-yellow-300 text-sm">
            Adapters in the array are tried left-to-right for reads. The first non-null result wins.
            All adapters receive every write. Put your fastest / most local adapter first.
          </p>
        </div>

        <h3 className="text-xl font-bold text-foreground mb-3">Three-layer Setup (local + API + audit log)</h3>
        <div className="bg-card border border-border rounded-xl p-4 overflow-x-auto mb-4">
          <pre className="text-foreground"><code>{`const auditAdapter: StorageAdapter = {
  async get() { return null; },  // audit log is write-only
  async set(key, value) {
    await fetch('/api/audit', {
      method: 'POST',
      body: JSON.stringify({ action: 'SET', key, value, ts: Date.now() }),
    });
  },
  async remove(key) {
    await fetch('/api/audit', {
      method: 'POST',
      body: JSON.stringify({ action: 'REMOVE', key, ts: Date.now() }),
    });
  },
  async getAll() { return {}; },
};

const adapter = composeAdapters([
  localStorageAdapter,  // 1. fast local read
  myApiAdapter,         // 2. durable server storage
  auditAdapter,         // 3. immutable audit trail
]);`}</code></pre>
        </div>
      </section>

      <section id="testing" className="mb-8">
        <h2 className="text-2xl font-bold text-foreground mt-12 mb-4">Testing with memoryAdapter</h2>
        <p className="mb-4 text-foreground">
          Use <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">memoryAdapter</code> in unit tests so there are no browser globals or network calls:
        </p>
        <div className="bg-card border border-border rounded-xl p-4 overflow-x-auto mb-4">
          <pre className="text-foreground"><code>{`import { renderHook, act } from '@testing-library/react';
import { useConsent, memoryAdapter } from '@tantainnovative/ndpr-toolkit';

test('consent is persisted via adapter', async () => {
  const { result } = renderHook(() =>
    useConsent({ adapter: memoryAdapter() })
  );

  await act(async () => {
    await result.current.updateConsent('analytics', true);
  });

  expect(result.current.hasConsented('analytics')).toBe(true);
});`}</code></pre>
        </div>
        <p className="text-sm text-muted-foreground">
          <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">memoryAdapter()</code> returns a fresh instance each call, so tests are fully isolated.
        </p>
      </section>

      <div className="mt-8 pt-6 border-t border-border">
        <h3 className="text-lg font-semibold text-foreground mb-3">Related Guides</h3>
        <div className="flex flex-wrap gap-3">
          <Link href="/docs/guides/backend-integration" className="text-blue-600 dark:text-blue-400 hover:underline text-sm">
            Backend Integration &rarr;
          </Link>
          <Link href="/docs/guides/managing-consent" className="text-blue-600 dark:text-blue-400 hover:underline text-sm">
            Managing Consent &rarr;
          </Link>
          <Link href="/docs/components/hooks" className="text-blue-600 dark:text-blue-400 hover:underline text-sm">
            Hooks Reference &rarr;
          </Link>
        </div>
      </div>
    </DocLayout>
  );
}
