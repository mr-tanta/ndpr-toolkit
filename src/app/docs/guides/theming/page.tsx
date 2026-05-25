'use client';

import Link from 'next/link';
import { DocLayout } from '@/components/docs/DocLayout';

export default function ThemingGuide() {
  return (
    <DocLayout
      title="Theming with NDPRThemeProvider"
      description="Two ways to theme: a typed React Context provider that injects --ndpr-* CSS variables from a JavaScript object, or direct CSS-variable overrides. Same end result; pick what fits your codebase."
    >
      <section id="overview" className="mb-10">
        <h2 className="text-2xl font-bold text-foreground mt-12 mb-4">Overview</h2>
        <p className="mb-4 text-foreground leading-relaxed">
          Every visual aspect of the toolkit is driven by <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">--ndpr-*</code> CSS custom
          properties defined in <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">@tantainnovative/ndpr-toolkit/styles</code>. New in 3.10.0,
          <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm"> NDPRThemeProvider</code> is a thin React Context wrapper that sets those
          variables from a typed JavaScript theme object — useful when your design tokens already live in JS / TS.
        </p>
        <p className="mb-4 text-foreground leading-relaxed">
          The provider is <strong>syntactic sugar</strong>. Underneath, components still consume the same
          CSS variables — so you can mix-and-match: use the provider for the bulk of the theme, then layer
          per-section overrides via plain CSS.
        </p>
      </section>

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
        <p className="mb-4 text-foreground leading-relaxed">
          The provider renders a single <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">&lt;div&gt;</code> wrapper with the
          variables set inline. Unset fields fall through to the stylesheet defaults.
        </p>
      </section>

      <section id="rgb-triplets" className="mb-10">
        <h2 className="text-2xl font-bold text-foreground mt-12 mb-4">Colour values are RGB triplets</h2>
        <p className="mb-4 text-foreground leading-relaxed">
          All colour tokens take the format <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">&apos;R G B&apos;</code> (space-separated channels, no
          <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm"> rgb()</code> wrapper). The stylesheet wraps them as
          <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">rgb(var(--ndpr-primary))</code>, which lets the same token drive solid backgrounds
          <em> and</em> transparent tints like <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">rgb(var(--ndpr-primary) / 0.12)</code>.
        </p>
        <p className="mb-4 text-foreground leading-relaxed">
          If your design system stores hex, add a one-liner converter:
        </p>
        <pre className="bg-card border border-border rounded-md p-4 overflow-x-auto text-sm mb-4">
          <code>{`const hexToRgbTriplet = (hex: string) => {
  const n = parseInt(hex.replace('#', ''), 16);
  return \`\${(n >> 16) & 255} \${(n >> 8) & 255} \${n & 255}\`;
};

const theme: NDPRTheme = {
  colors: { primary: hexToRgbTriplet('#16a34a') },
};`}</code>
        </pre>
      </section>

      <section id="full-theme" className="mb-10">
        <h2 className="text-2xl font-bold text-foreground mt-12 mb-4">Full <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">NDPRTheme</code> reference</h2>
        <p className="mb-4 text-foreground leading-relaxed">
          Every field is optional and maps to one <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">--ndpr-*</code> CSS variable.
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
          Setting <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">mode: &apos;dark&apos;</code> stamps <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">data-theme=&quot;dark&quot;</code> on the wrapper,
          which activates the dark-mode block in the stylesheet. The toolkit also auto-switches via
          <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm"> prefers-color-scheme</code>, so most apps don&apos;t need to set this explicitly.
        </p>
        <pre className="bg-card border border-border rounded-md p-4 overflow-x-auto text-sm mb-4">
          <code>{`const [mode, setMode] = useState<'light' | 'dark'>('light');

<NDPRThemeProvider theme={{ mode, ...rest }}>
  <button onClick={() => setMode(m => m === 'dark' ? 'light' : 'dark')}>
    Toggle theme
  </button>
  <App />
</NDPRThemeProvider>`}</code>
        </pre>
      </section>

      <section id="when-not-to" className="mb-10">
        <h2 className="text-2xl font-bold text-foreground mt-12 mb-4">When NOT to use the provider</h2>
        <ul className="list-disc pl-6 space-y-2 text-foreground mb-4">
          <li>You already manage design tokens in CSS — write <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">:root {`{ --ndpr-primary: 22 163 74; }`}</code> directly.</li>
          <li>You need to scope theme to a subtree without a wrapping element — apply <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">--ndpr-*</code> overrides to your existing ancestor.</li>
          <li>You&apos;re bringing your own design system entirely — use <Link href="/docs/guides/styling-architecture" className="text-primary hover:underline">the <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">/unstyled</code> entry</Link> and skip CSS variables altogether.</li>
        </ul>
      </section>

      <section id="related" className="mb-10">
        <h2 className="text-2xl font-bold text-foreground mt-12 mb-4">Related</h2>
        <ul className="list-disc pl-6 space-y-2 text-foreground mb-4">
          <li><Link href="/docs/guides/styling-customization" className="text-primary hover:underline">Styling &amp; Customization</Link> — per-component <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">classNames</code> slot API.</li>
          <li><Link href="/docs/guides/styling-architecture" className="text-primary hover:underline">Styling Architecture</Link> — how the stylesheet, BEM classes, and CSS variables fit together.</li>
        </ul>
      </section>
    </DocLayout>
  );
}
