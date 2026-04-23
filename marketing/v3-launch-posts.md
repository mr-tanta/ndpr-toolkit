# NDPR Toolkit v3 — Launch Posts

---

## LinkedIn Post

I just shipped v3 of the NDPA Toolkit — an open-source React library that gives Nigerian developers production-ready compliance infrastructure for the Nigeria Data Protection Act 2023.

Here's what v3 brings:

3 files. That's all it takes for full NDPA compliance:

```
// layout.tsx
<NDPRProvider orgName="Your Company" dpoEmail="dpo@company.ng">
  {children}
  <NDPRConsent />
</NDPRProvider>

// privacy/page.tsx
<NDPRPrivacyPolicy />

// data-request/page.tsx
<NDPRSubjectRights />
```

Consent banner, privacy policy generator, data subject rights portal — done.

But v3 isn't just presets. It's a layered architecture:

- Pluggable storage adapters — localStorage, REST API, Prisma, Drizzle, or build your own
- Compound components — <Consent.Provider> + <Consent.Banner> for fully custom layouts
- Compliance score engine — 0-100 rating across all 8 NDPA modules with actionable recommendations
- Adaptive Privacy Policy Wizard — 4-step generator with 15-point NDPA compliance checker, PDF/DOCX/HTML export, draft auto-save
- Backend recipes — Prisma schemas, Next.js API routes, Express middleware
- CLI scaffolder — npx @tantainnovative/create-ndpr detects your stack and generates everything

The numbers:
- 8 compliance modules
- 788 tests
- 14 entry points (tree-shakeable)
- Zero runtime dependencies
- React 16-19 compatible

Every component supports 3 styling modes: default Tailwind, classNames overrides, or fully unstyled. Dark mode built in. i18n locale support for all text strings.

Nigeria's tech ecosystem is growing fast. The NDPA is real, the NDPC is enforcing, and compliance shouldn't be a 6-month project. It should be an afternoon.

Install: pnpm add @tantainnovative/ndpr-toolkit
Docs: https://ndprtoolkit.com.ng
GitHub: https://github.com/mr-tanta/ndpr-toolkit
npm: https://npmjs.com/package/@tantainnovative/ndpr-toolkit

Built by Abraham Esandayinze Tanta | Tanta Innovative

#NDPA #NigeriaDataProtection #OpenSource #React #TypeScript #Compliance #DataProtection #NDPC #Privacy #Developer #TechInAfrica

---

## X (Twitter) Thread

**Tweet 1 (Hook):**
I just shipped v3 of the NDPA Toolkit — open-source React components for Nigeria Data Protection Act compliance.

3 files = full compliance. Consent, privacy policy, data subject rights. Done.

pnpm add @tantainnovative/ndpr-toolkit

Thread

**Tweet 2 (The Problem):**
Nigeria's NDPA 2023 is real. The NDPC is enforcing. Fines are serious.

But building compliance from scratch takes months. Consent banners, DSR portals, DPIAs, breach notifications, privacy policies, ROPA...

v3 ships all 8 modules. Ready to deploy.

**Tweet 3 (Zero Config):**
The fastest way to comply:

```tsx
<NDPRConsent />          // consent banner
<NDPRPrivacyPolicy />    // full policy generator
<NDPRSubjectRights />    // data request portal
```

Zero props. Zero config. NDPA-compliant defaults.

**Tweet 4 (For Power Users):**
But zero-config is just the surface. v3 has 5 layers:

- Presets (one-liners)
- Compound components (custom layouts)
- Headless hooks (full control)
- Core (types + validators, no React)
- Adapters (pluggable storage)

Use the layer you need.

**Tweet 5 (Adapters):**
The adapter pattern is the killer feature:

```tsx
// localStorage (default)
useConsent({ options })

// Your API
useConsent({ options, adapter: apiAdapter('/api/consent') })

// Both at once
useConsent({ options, adapter: composeAdapters(localStorage, api) })
```

Same hook. Any backend.

**Tweet 6 (Privacy Policy):**
The privacy policy generator got a full upgrade:

- 4-step adaptive wizard
- Asks what data you collect, assembles the right sections
- 15-point NDPA compliance checker with auto-fix
- PDF, DOCX, HTML, Markdown export
- Draft auto-save

No more copying templates from the internet.

**Tweet 7 (Compliance Score):**
Want to know where you stand?

```tsx
const report = getComplianceScore(input);
// score: 73/100
// rating: "good"
// recommendations: [...]
```

Weighted scoring across all 8 NDPA modules. Tells you exactly what to fix.

**Tweet 8 (Stats):**
v3 by the numbers:

- 8 compliance modules
- 788 passing tests
- 56 test suites
- 14 tree-shakeable entry points
- 0 runtime dependencies
- React 16-19 support
- Full dark mode
- i18n locale support

**Tweet 9 (CTA):**
Get started:

Install: pnpm add @tantainnovative/ndpr-toolkit
Scaffold: npx @tantainnovative/create-ndpr
Docs: https://ndprtoolkit.com.ng
GitHub: https://github.com/mr-tanta/ndpr-toolkit

Star it if you think Nigerian developers deserve better compliance tools.

Built with care by @mr_tanta

---

## Blog Post (for content/blog/)

Title: "Introducing NDPA Toolkit v3 — Compliance Infrastructure, Not Just Components"

Slug: introducing-ndpa-toolkit-v3

---

Three files. That's all it takes to add full NDPA 2023 compliance to a Next.js application.

A layout wrapper. A privacy policy page. A data request portal. Three files, and your application handles consent collection, privacy policy generation, and data subject rights — all aligned with the Nigeria Data Protection Act.

This is v3 of the NDPA Toolkit.

### Why v3

v2 was a component library. You imported ConsentBanner, wired up callbacks, managed localStorage yourself, and hoped you covered all the NDPA requirements. It worked, but it required developers to understand both the toolkit API and the regulation.

v3 is different. It's compliance infrastructure — a layered architecture where every developer finds the right level of abstraction for their needs.

### The Five Layers

**Layer 1: Presets** — Zero-config components that work out of the box. `<NDPRConsent />` renders a fully functional consent banner with NDPA-compliant defaults. No options array, no callbacks, no storage configuration.

**Layer 2: Compound Components** — When you need layout control, decompose any module into sub-components. `<Consent.Provider>` wraps your tree, `<Consent.OptionList>` renders checkboxes, `<Consent.AcceptButton>` handles acceptance. Build any layout you want.

**Layer 3: Headless Hooks** — `useConsent()`, `useDSR()`, `useBreach()` — pure state management with no UI opinions. Every hook accepts a pluggable storage adapter.

**Layer 4: Core** — Types, validators, and utilities that work in any JavaScript environment. No React dependency. Import `getComplianceScore()` in a Node.js script, a Deno edge function, or a browser.

**Layer 5: Adapters** — The `StorageAdapter<T>` interface has three methods: `load()`, `save()`, `remove()`. Implement them for any backend. We ship six built-in adapters: localStorage, sessionStorage, cookie, REST API, in-memory (for testing), and `composeAdapters` for writing to multiple targets simultaneously.

### The Adaptive Privacy Policy Wizard

The privacy policy module received the biggest upgrade. Instead of filling in a template, v3.2 introduces a 4-step adaptive wizard:

1. Tell us about your organization
2. Select what data you collect (16 categories across 5 groups)
3. Describe how you process data (purposes, third parties, cross-border transfers)
4. Review, customize, and export

The wizard assembles the right sections based on your answers. Collecting financial data? You get PCI-DSS language in the security section. Processing children's data? NDPA Section 31 protections are automatically included. Using third-party processors? They're listed by name with their purposes.

A 15-point NDPA compliance checker runs in real-time as you build the policy. It scores your policy against mandatory NDPA disclosures and offers one-click auto-fix suggestions for any gaps. When you're done, export as professional PDF (with cover page and table of contents), editable DOCX, embeddable HTML, or clean Markdown.

### The Compliance Score Engine

`getComplianceScore()` evaluates your organization's compliance posture across all eight NDPA modules. It returns a weighted score (0-100), a rating, per-module breakdowns, and prioritized recommendations with effort estimates.

The weights reflect NDPA enforcement priorities: consent (20%), data subject rights (15%), breach notification (15%), followed by policy, DPIA, lawful basis, ROPA, and cross-border transfers.

### Backend Integration

The toolkit is client-side, but compliance isn't. The `@tantainnovative/ndpr-recipes` package provides everything you need to persist compliance data:

- Prisma schema with 5 NDPA compliance tables
- Drizzle ORM schema
- Next.js App Router API routes for consent, DSR, breach, ROPA, and compliance scoring
- Express routes and middleware
- Prisma and Drizzle adapters that implement `StorageAdapter`

Or run `npx @tantainnovative/create-ndpr` — it detects your stack (Next.js, Express, Prisma, Drizzle) and generates the right files automatically.

### The Numbers

- 8 compliance modules covering the full NDPA
- 788 tests across 56 test suites
- 14 tree-shakeable entry points
- Zero runtime dependencies
- React 16, 17, 18, and 19 compatible
- Full dark mode support on all components
- i18n locale support for all text strings
- 3 styling modes: default Tailwind, classNames overrides, fully unstyled

### Get Started

```bash
pnpm add @tantainnovative/ndpr-toolkit
```

Documentation: https://ndprtoolkit.com.ng
GitHub: https://github.com/mr-tanta/ndpr-toolkit
npm: https://npmjs.com/package/@tantainnovative/ndpr-toolkit

Nigeria's tech ecosystem is one of Africa's fastest growing. The NDPA is here, the NDPC is enforcing, and compliance should be a solved problem — not a six-month project. That's what v3 is for.

---

*Abraham Esandayinze Tanta is a software engineer and the creator of the NDPA Toolkit. Follow on GitHub (@mr-tanta) or LinkedIn (mr-tanta).*
