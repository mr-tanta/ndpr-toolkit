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
        <h2 className="text-2xl font-bold mb-4">What Are Adapters?</h2>
        <p className="mb-4">
          In v3, every hook that reads or writes persistent data accepts an optional <code className="bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded text-sm">adapter</code> prop.
          An adapter is a small object that implements the <strong>StorageAdapter</strong> interface — four methods that map to
          read, write, update, and delete operations.
        </p>
        <p className="mb-4">
          Because the adapter sits between the toolkit and your storage layer, you can swap backends without touching
          any of your component code. A team prototype might use <code className="bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded text-sm">localStorageAdapter</code>; a production
          deployment can point the same components at a REST API adapter — zero component changes required.
        </p>
        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-md mb-4">
          <h4 className="text-blue-800 dark:text-blue-200 font-medium mb-2">Why This Matters for NDPA Compliance</h4>
          <p className="text-blue-700 dark:text-blue-300 text-sm">
            The NDPA 2023 requires organisations to demonstrate that consent records are accurate, timestamped, and auditable.
            Adapters make it straightforward to persist consent to a durable, queryable backend (e.g. a database) while keeping
            your UI layer clean and testable.
          </p>
        </div>
      </section>

      <section id="interface" className="mb-8">
        <h2 className="text-2xl font-bold mb-4">The StorageAdapter Interface</h2>
        <p className="mb-4">
          Every adapter must implement the following TypeScript interface, exported from{' '}
          <code className="bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded text-sm">@tantainnovative/ndpr-toolkit</code>:
        </p>
        <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-md mb-4">
          <div className="bg-gray-800 text-gray-200 p-4 rounded-md overflow-x-auto">
            <pre><code>{`export interface StorageAdapter<T = unknown> {
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
        </div>
        <p className="mb-4">
          All methods are <strong>async</strong>. Even the built-in localStorage adapter wraps its synchronous calls in
          resolved promises so your application code is always consistent regardless of the underlying storage mechanism.
        </p>
      </section>

      <section id="built-in" className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Built-in Adapters</h2>
        <p className="mb-4">
          The toolkit ships six ready-to-use adapters. Import them directly from the package:
        </p>
        <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-md mb-6">
          <div className="bg-gray-800 text-gray-200 p-4 rounded-md overflow-x-auto">
            <pre><code>{`import {
  localStorageAdapter,
  sessionStorageAdapter,
  cookieAdapter,
  apiAdapter,
  memoryAdapter,
  composeAdapters,
} from '@tantainnovative/ndpr-toolkit';`}</code></pre>
          </div>
        </div>

        <div className="overflow-x-auto mb-6">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-gray-100 dark:bg-gray-700">
                <th className="border border-gray-200 dark:border-gray-600 px-4 py-2 text-left font-semibold">Adapter</th>
                <th className="border border-gray-200 dark:border-gray-600 px-4 py-2 text-left font-semibold">Storage</th>
                <th className="border border-gray-200 dark:border-gray-600 px-4 py-2 text-left font-semibold">Best For</th>
                <th className="border border-gray-200 dark:border-gray-600 px-4 py-2 text-left font-semibold">SSR Safe</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <td className="border border-gray-200 dark:border-gray-600 px-4 py-2 font-mono">localStorageAdapter</td>
                <td className="border border-gray-200 dark:border-gray-600 px-4 py-2">Window.localStorage</td>
                <td className="border border-gray-200 dark:border-gray-600 px-4 py-2">Prototypes, SPAs</td>
                <td className="border border-gray-200 dark:border-gray-600 px-4 py-2">Yes (no-ops on server)</td>
              </tr>
              <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                <td className="border border-gray-200 dark:border-gray-600 px-4 py-2 font-mono">sessionStorageAdapter</td>
                <td className="border border-gray-200 dark:border-gray-600 px-4 py-2">Window.sessionStorage</td>
                <td className="border border-gray-200 dark:border-gray-600 px-4 py-2">Tab-scoped sessions</td>
                <td className="border border-gray-200 dark:border-gray-600 px-4 py-2">Yes (no-ops on server)</td>
              </tr>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <td className="border border-gray-200 dark:border-gray-600 px-4 py-2 font-mono">cookieAdapter</td>
                <td className="border border-gray-200 dark:border-gray-600 px-4 py-2">Browser cookies</td>
                <td className="border border-gray-200 dark:border-gray-600 px-4 py-2">Cross-tab, SSR access</td>
                <td className="border border-gray-200 dark:border-gray-600 px-4 py-2">Yes</td>
              </tr>
              <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                <td className="border border-gray-200 dark:border-gray-600 px-4 py-2 font-mono">apiAdapter</td>
                <td className="border border-gray-200 dark:border-gray-600 px-4 py-2">REST API endpoint</td>
                <td className="border border-gray-200 dark:border-gray-600 px-4 py-2">Production, multi-device</td>
                <td className="border border-gray-200 dark:border-gray-600 px-4 py-2">Yes</td>
              </tr>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <td className="border border-gray-200 dark:border-gray-600 px-4 py-2 font-mono">memoryAdapter</td>
                <td className="border border-gray-200 dark:border-gray-600 px-4 py-2">In-memory Map</td>
                <td className="border border-gray-200 dark:border-gray-600 px-4 py-2">Testing, SSR fallback</td>
                <td className="border border-gray-200 dark:border-gray-600 px-4 py-2">Yes</td>
              </tr>
              <tr className="bg-gray-50 dark:bg-gray-800/50">
                <td className="border border-gray-200 dark:border-gray-600 px-4 py-2 font-mono">composeAdapters</td>
                <td className="border border-gray-200 dark:border-gray-600 px-4 py-2">Multiple (ordered)</td>
                <td className="border border-gray-200 dark:border-gray-600 px-4 py-2">Local cache + API sync</td>
                <td className="border border-gray-200 dark:border-gray-600 px-4 py-2">Yes</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section id="using-with-hooks" className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Using Adapters with Hooks</h2>
        <p className="mb-4">
          Pass the adapter as a configuration option to any hook that supports it. Here is a minimal example using{' '}
          <code className="bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded text-sm">useConsent</code>:
        </p>
        <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-md mb-4">
          <div className="bg-gray-800 text-gray-200 p-4 rounded-md overflow-x-auto">
            <pre><code>{`import { useConsent, localStorageAdapter } from '@tantainnovative/ndpr-toolkit';

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
        </div>

        <p className="mb-4">
          Swap to a production API adapter by changing a single line — your component stays the same:
        </p>
        <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-md mb-4">
          <div className="bg-gray-800 text-gray-200 p-4 rounded-md overflow-x-auto">
            <pre><code>{`import { useConsent, apiAdapter } from '@tantainnovative/ndpr-toolkit';

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
        </div>
      </section>

      <section id="custom-adapter" className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Creating a Custom Adapter</h2>
        <p className="mb-4">
          Any object that satisfies the <code className="bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded text-sm">StorageAdapter</code> interface works.
          The following example stores consent records in a Supabase table:
        </p>
        <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-md mb-4">
          <div className="bg-gray-800 text-gray-200 p-4 rounded-md overflow-x-auto">
            <pre><code>{`import type { StorageAdapter } from '@tantainnovative/ndpr-toolkit';
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
        </div>
        <p className="mb-4">
          Then use it anywhere you would pass a built-in adapter:
        </p>
        <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-md mb-4">
          <div className="bg-gray-800 text-gray-200 p-4 rounded-md overflow-x-auto">
            <pre><code>{`const { consents } = useConsent({ adapter: supabaseConsentAdapter });`}</code></pre>
          </div>
        </div>
      </section>

      <section id="compose-adapters" className="mb-8">
        <h2 className="text-2xl font-bold mb-4">The composeAdapters Pattern</h2>
        <p className="mb-4">
          <code className="bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded text-sm">composeAdapters</code> chains multiple adapters so that reads come from the first available source and writes fan out
          to all layers. This is the recommended production pattern: serve reads from localStorage (fast, offline-capable)
          and sync writes to your API (durable, auditable).
        </p>
        <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-md mb-4">
          <div className="bg-gray-800 text-gray-200 p-4 rounded-md overflow-x-auto">
            <pre><code>{`import {
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
        </div>

        <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-md mb-4">
          <h4 className="text-yellow-800 dark:text-yellow-200 font-medium mb-2">Order Matters</h4>
          <p className="text-yellow-700 dark:text-yellow-300 text-sm">
            Adapters in the array are tried left-to-right for reads. The first non-null result wins.
            All adapters receive every write. Put your fastest / most local adapter first.
          </p>
        </div>

        <h3 className="text-xl font-bold mb-3">Three-layer Setup (local + API + audit log)</h3>
        <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-md mb-4">
          <div className="bg-gray-800 text-gray-200 p-4 rounded-md overflow-x-auto">
            <pre><code>{`const auditAdapter: StorageAdapter = {
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
        </div>
      </section>

      <section id="testing" className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Testing with memoryAdapter</h2>
        <p className="mb-4">
          Use <code className="bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded text-sm">memoryAdapter</code> in unit tests so there are no browser globals or network calls:
        </p>
        <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-md mb-4">
          <div className="bg-gray-800 text-gray-200 p-4 rounded-md overflow-x-auto">
            <pre><code>{`import { renderHook, act } from '@testing-library/react';
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
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          <code className="bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded text-sm">memoryAdapter()</code> returns a fresh instance each call, so tests are fully isolated.
        </p>
      </section>

      <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold mb-3">Related Guides</h3>
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
