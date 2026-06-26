'use client';

import Link from 'next/link';
import { DocLayout } from '@/components/docs/DocLayout';
import { ProductionReadinessBlock } from '@/components/docs/ProductionReadinessBlock';

export default function NDPRThemeProviderDocs() {
  return (
    <DocLayout
      title="NDPRThemeProvider"
      description="Typed React Context wrapper that injects --ndpr-* CSS custom properties from a JavaScript theme object. Pair it with the toolkit stylesheet to brand every component in one place."
    >
      <section id="overview" className="mb-10">
        <h2 className="text-2xl font-bold text-foreground mt-12 mb-4">Overview</h2>
        <p className="mb-4 text-foreground leading-relaxed">
          <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">NDPRThemeProvider</code> is a thin wrapper around the toolkit&apos;s
          existing CSS-variable theming model. It renders a single
          <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">&lt;div&gt;</code> with
          <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">--ndpr-*</code> custom properties set inline, so every nested toolkit
          component picks them up automatically.
        </p>
        <p className="mb-4 text-foreground leading-relaxed">
          The provider is <strong>syntactic sugar</strong> — it is not a runtime requirement. Unset fields cascade from the
          stylesheet defaults at <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">@tantainnovative/ndpr-toolkit/styles</code>, so you can
          set just the few tokens you care about (brand colour, radius) and leave the rest alone.
        </p>
      </section>

      <ProductionReadinessBlock
        moduleName="NDPRThemeProvider"
        importRows={[
          {
            packagePath: '@tantainnovative/ndpr-toolkit',
            exports: 'NDPRThemeProvider, NDPRTheme',
            useCase: 'Typed theme object for scoped CSS-variable branding.',
          },
          {
            packagePath: '@tantainnovative/ndpr-toolkit/styles',
            exports: 'global stylesheet',
            useCase: 'Base token definitions and component styles consumed by the provider.',
          },
          {
            packagePath: '@tantainnovative/ndpr-toolkit/unstyled',
            exports: 'unstyled entry points',
            useCase: 'Alternative when your design system owns all component styling.',
          },
          {
            packagePath: '@tantainnovative/ndpr-recipes',
            exports: 'src/nextjs/app-router/layout-example.tsx',
            useCase: 'Reference root layout for combining provider configuration and theme tokens.',
          },
        ]}
        checklist={[
          'Confirm brand colors meet contrast requirements in consent, DSR, breach, and dashboard states.',
          'Use RGB triplets consistently and convert design-system hex values before passing them to the theme.',
          'Test light mode, dark mode, high-contrast OS settings, and mobile breakpoints.',
          'Keep legal/action states visually distinct: success, warning, destructive, disabled, and focus ring.',
          'Decide whether the provider or raw CSS variables owns production theming, then document that ownership.',
        ]}
        backendNotes={[
          'Theme values are client-rendered UI configuration; keep secrets and tenant-private data out of theme objects.',
          'For multi-tenant apps, load approved theme tokens from tenant configuration and validate values before rendering.',
          'Use a root layout or shell component so theme tokens wrap all toolkit surfaces consistently.',
          'Pair theme releases with visual regression checks because legal forms and banners are user-facing controls.',
        ]}
        testingNotes={[
          'Inspect consent banners, forms, tables, modals, and dashboard score colors under the final theme.',
          'Run keyboard focus checks so custom ring colors remain visible on every interactive control.',
          'Check dark-mode text, borders, warning states, and disabled states for readability.',
          'Verify exported or printed policy views are not dependent on unreadable screen-only colors.',
        ]}
        commonMistakes={[
          'Passing hex colors directly instead of RGB triplets.',
          'Changing primary color without checking focus, warning, destructive, and success states.',
          'Scoping the provider too low so modals or banners render outside the themed subtree.',
          'Using the theme provider when raw CSS variables or unstyled components would be simpler for the host design system.',
        ]}
      />

      <section id="quickstart" className="mb-10">
        <h2 className="text-2xl font-bold text-foreground mt-12 mb-4">Quickstart</h2>
        <pre className="bg-card border border-border rounded-md p-4 overflow-x-auto text-sm mb-4">
          <code>{`import { NDPRThemeProvider, type NDPRTheme } from '@tantainnovative/ndpr-toolkit';
import '@tantainnovative/ndpr-toolkit/styles';

const theme: NDPRTheme = {
  colors: {
    primary: '22 163 74',          // RGB triplet — green-600
    primaryHover: '21 128 61',     // green-700
  },
  radius: { base: '0.75rem' },
  font: { sans: '"Inter", system-ui, sans-serif' },
};

export default function App() {
  return (
    <NDPRThemeProvider theme={theme}>
      <YourApp />
    </NDPRThemeProvider>
  );
}`}</code>
        </pre>
      </section>

      <section id="rgb-triplets" className="mb-10">
        <h2 className="text-2xl font-bold text-foreground mt-12 mb-4">Colour values are RGB triplets</h2>
        <p className="mb-4 text-foreground leading-relaxed">
          Every colour token takes the format <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">&apos;R G B&apos;</code> — three
          space-separated channels, no <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">rgb()</code> wrapper. The stylesheet wraps them
          internally as <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">rgb(var(--ndpr-primary))</code>, which lets the same token power
          solid backgrounds and transparent tints like <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">rgb(var(--ndpr-primary) / 0.12)</code>.
        </p>
        <pre className="bg-card border border-border rounded-md p-4 overflow-x-auto text-sm mb-4">
          <code>{`// If your design system stores hex, add a one-liner converter:
const hexToRgbTriplet = (hex: string) => {
  const n = parseInt(hex.replace('#', ''), 16);
  return \`\${(n >> 16) & 255} \${(n >> 8) & 255} \${n & 255}\`;
};

const theme: NDPRTheme = {
  colors: { primary: hexToRgbTriplet('#16a34a') },
};`}</code>
        </pre>
      </section>

      <section id="props" className="mb-10">
        <h2 className="text-2xl font-bold text-foreground mt-12 mb-4">Props</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm mb-4">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-2 pr-4 font-semibold">Prop</th>
                <th className="text-left py-2 pr-4 font-semibold">Type</th>
                <th className="text-left py-2 font-semibold">Description</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-border">
                <td className="py-2 pr-4"><code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">theme</code></td>
                <td className="py-2 pr-4"><code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">NDPRTheme</code></td>
                <td className="py-2">Optional partial theme. Only set fields produce CSS variables; unset fields cascade from the stylesheet.</td>
              </tr>
              <tr className="border-b border-border">
                <td className="py-2 pr-4"><code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">className</code></td>
                <td className="py-2 pr-4"><code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">string</code></td>
                <td className="py-2">Optional class on the wrapping <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">&lt;div&gt;</code>. Useful for Tailwind utilities (e.g. <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">&quot;min-h-screen bg-background&quot;</code>).</td>
              </tr>
              <tr className="border-b border-border">
                <td className="py-2 pr-4"><code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">children</code></td>
                <td className="py-2 pr-4"><code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">React.ReactNode</code></td>
                <td className="py-2">App tree. Anything below the provider inherits the theme.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section id="theme-shape" className="mb-10">
        <h2 className="text-2xl font-bold text-foreground mt-12 mb-4">NDPRTheme shape</h2>
        <p className="mb-4 text-foreground leading-relaxed">
          Every field is optional. The full type:
        </p>
        <pre className="bg-card border border-border rounded-md p-4 overflow-x-auto text-sm mb-4">
          <code>{`interface NDPRTheme {
  mode?: 'light' | 'dark';
  colors?: {
    primary?: string;              // --ndpr-primary
    primaryHover?: string;         // --ndpr-primary-hover
    primaryForeground?: string;    // --ndpr-primary-foreground
    background?: string;           // --ndpr-background
    surface?: string;              // --ndpr-surface
    foreground?: string;           // --ndpr-foreground
    muted?: string;                // --ndpr-muted
    mutedForeground?: string;      // --ndpr-muted-foreground
    border?: string;               // --ndpr-border
    input?: string;                // --ndpr-input
    ring?: string;                 // --ndpr-ring
    success?: string;              // --ndpr-success
    destructive?: string;          // --ndpr-destructive
    warning?: string;              // --ndpr-warning
  };
  radius?: { sm?: string; base?: string; lg?: string; full?: string };
  spacing?: { 1?: string; 2?: string; 3?: string; 4?: string; 5?: string; 6?: string; 8?: string };
  shadow?: { sm?: string; base?: string; lg?: string };
  font?: {
    sans?: string;
    sizeXs?: string; sizeSm?: string; sizeBase?: string;
    sizeLg?: string; sizeXl?: string;
    lineHeight?: string; lineHeightTight?: string;
  };
  transition?: { base?: string; slow?: string };
  z?: { banner?: number | string; modal?: number | string };
}`}</code>
        </pre>
      </section>

      <section id="dark-mode" className="mb-10">
        <h2 className="text-2xl font-bold text-foreground mt-12 mb-4">Dark mode</h2>
        <p className="mb-4 text-foreground leading-relaxed">
          Setting <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">mode: &apos;dark&apos;</code> stamps
          <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm"> data-theme=&quot;dark&quot;</code> on the wrapper, which activates the dark-mode block
          in the stylesheet. The toolkit also auto-switches via <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">prefers-color-scheme</code>,
          so most apps don&apos;t need to set <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">mode</code> explicitly.
        </p>
        <pre className="bg-card border border-border rounded-md p-4 overflow-x-auto text-sm mb-4">
          <code>{`const [mode, setMode] = useState<'light' | 'dark'>('light');

<NDPRThemeProvider theme={{ mode }}>
  <button onClick={() => setMode(m => m === 'dark' ? 'light' : 'dark')}>
    Toggle theme
  </button>
  <App />
</NDPRThemeProvider>`}</code>
        </pre>
      </section>

      <section id="when-not" className="mb-10">
        <h2 className="text-2xl font-bold text-foreground mt-12 mb-4">When NOT to use the provider</h2>
        <ul className="list-disc pl-6 space-y-2 text-foreground mb-4">
          <li>You manage design tokens in CSS — write <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">:root {`{ --ndpr-primary: 22 163 74; }`}</code> directly.</li>
          <li>You need to scope tokens to a subtree without an extra DOM node — apply <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">--ndpr-*</code> overrides on your existing ancestor.</li>
          <li>You&apos;re bringing your own design system — use the <Link href="/docs/guides/styling-architecture" className="text-primary hover:underline"><code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">/unstyled</code> entry</Link> and skip CSS variables entirely.</li>
        </ul>
      </section>

      <section id="related" className="mb-10">
        <h2 className="text-2xl font-bold text-foreground mt-12 mb-4">Related</h2>
        <ul className="list-disc pl-6 space-y-2 text-foreground mb-4">
          <li><Link href="/docs/guides/theming" className="text-primary hover:underline">Theming guide</Link> — goes deeper on the RGB-triplet convention, mixing the provider with raw CSS, and full-bleed brand swaps.</li>
          <li><Link href="/docs/guides/styling-customization" className="text-primary hover:underline">Styling &amp; Customization</Link> — per-component <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">classNames</code> slot API.</li>
          <li><Link href="/docs/guides/styling-architecture" className="text-primary hover:underline">Styling architecture</Link> — how the stylesheet, BEM classes, and CSS variables fit together.</li>
        </ul>
      </section>
    </DocLayout>
  );
}
