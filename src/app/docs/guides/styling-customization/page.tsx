'use client';

import Link from 'next/link';
import { DocLayout } from '@/components/docs/DocLayout';

export default function StylingCustomizationGuide() {
  return (
    <DocLayout
      title="Styling & Customization"
      description="Control the look and feel of every NDPA Toolkit component using classNames overrides, unstyled mode, or your favourite CSS framework"
    >
      <div className="flex mb-6 space-x-2">
        <Link
          href="/docs/components/consent-management"
          className="inline-flex items-center px-3 py-1.5 text-sm border border-border rounded-md text-foreground hover:bg-muted transition-colors"
        >
          Consent Component Docs
        </Link>
        <Link
          href="/docs/guides/managing-consent"
          className="inline-flex items-center px-3 py-1.5 text-sm border border-border rounded-md text-foreground hover:bg-muted transition-colors"
        >
          Managing Consent Guide
        </Link>
      </div>

      {/* ── Introduction ── */}
      <section id="introduction" className="mb-8">
        <h2 className="text-2xl font-bold text-foreground mt-12 mb-4">Introduction</h2>
        <p className="mb-4 text-foreground">
          Every visible component in the NDPA Toolkit ships with sensible default
          Tailwind CSS classes, but gives you full control over the final
          appearance. You can work in one of three modes:
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="border border-border rounded-xl p-4 bg-card">
            <h4 className="font-semibold text-foreground mb-1">1. Default</h4>
            <p className="text-sm text-muted-foreground">
              Use the built-in Tailwind styles as-is. Zero configuration required.
            </p>
          </div>
          <div className="border border-border rounded-xl p-4 bg-card">
            <h4 className="font-semibold text-foreground mb-1">2. classNames Overrides</h4>
            <p className="text-sm text-muted-foreground">
              Replace individual section classes while keeping the rest of the
              defaults intact.
            </p>
          </div>
          <div className="border border-border rounded-xl p-4 bg-card">
            <h4 className="font-semibold text-foreground mb-1">3. Unstyled</h4>
            <p className="text-sm text-muted-foreground">
              Strip every default class so you start from a blank canvas and apply
              your own styles from scratch.
            </p>
          </div>
        </div>
      </section>

      {/* ── Mode 1: Default ── */}
      <section id="default-mode" className="mb-8">
        <h2 className="text-2xl font-bold text-foreground mt-12 mb-4">Mode 1 &mdash; Default Styles</h2>
        <p className="mb-4 text-foreground">
          If the default appearance works for your project, simply import and
          render the component. No extra props needed.
        </p>
        <div className="bg-card border border-border rounded-xl p-4 overflow-x-auto">
          <pre className="text-foreground"><code>{`import { ConsentBanner } from '@tantainnovative/ndpr-toolkit';

function App() {
  return (
    <ConsentBanner
      options={consentOptions}
      onSave={handleSave}
      position="bottom"
    />
  );
}`}</code></pre>
        </div>
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 p-4 rounded-xl mt-4">
          <p className="text-blue-700 dark:text-blue-300 text-sm mb-0">
            <strong>Tip:</strong> Start with the defaults and only customise
            what you need. This keeps your code minimal and ensures you benefit
            from future style improvements automatically.
          </p>
        </div>
      </section>

      {/* ── Mode 2: classNames Overrides ── */}
      <section id="classnames-overrides" className="mb-8">
        <h2 className="text-2xl font-bold text-foreground mt-12 mb-4">Mode 2 &mdash; classNames Overrides</h2>
        <p className="mb-4 text-foreground">
          Every component exposes a <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">classNames</code> prop &mdash; an object keyed by semantic section name.
          When you provide a value for a key, it <strong>replaces</strong> the
          default class for that section while leaving every other section
          untouched.
        </p>
        <div className="bg-card border border-border rounded-xl p-4 overflow-x-auto">
          <pre className="text-foreground"><code>{`import { ConsentBanner } from '@tantainnovative/ndpr-toolkit';

<ConsentBanner
  options={consentOptions}
  onSave={handleSave}
  classNames={{
    root: 'fixed inset-x-0 bottom-0 bg-indigo-900 text-white p-6',
    acceptButton: 'bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-6 rounded-full',
    rejectButton: 'bg-transparent border border-white text-white py-2 px-6 rounded-full',
  }}
/>`}</code></pre>
        </div>
        <p className="mt-4 text-sm text-muted-foreground">
          In the example above, only <code className="bg-card border border-border px-1 rounded">root</code>,{' '}
          <code className="bg-card border border-border px-1 rounded">acceptButton</code>, and{' '}
          <code className="bg-card border border-border px-1 rounded">rejectButton</code> are
          customised. Every other section (title, description, option items,
          etc.) retains its built-in Tailwind styling.
        </p>
      </section>

      {/* ── Mode 3: Unstyled ── */}
      <section id="unstyled-mode" className="mb-8">
        <h2 className="text-2xl font-bold text-foreground mt-12 mb-4">Mode 3 &mdash; Unstyled</h2>
        <p className="mb-4 text-foreground">
          Set <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">unstyled=&#123;true&#125;</code> to
          remove <em>all</em> default Tailwind classes from the component. This
          gives you a blank slate so you can apply your own design system,
          whether that is Bootstrap, CSS Modules, vanilla CSS, or something else
          entirely.
        </p>
        <div className="bg-card border border-border rounded-xl p-4 overflow-x-auto">
          <pre className="text-foreground"><code>{`<ConsentBanner
  options={consentOptions}
  onSave={handleSave}
  unstyled={true}
  classNames={{
    root: 'my-banner',
    container: 'my-banner__inner',
    title: 'my-banner__title',
    description: 'my-banner__desc',
    acceptButton: 'my-banner__btn my-banner__btn--accept',
    rejectButton: 'my-banner__btn my-banner__btn--reject',
  }}
/>`}</code></pre>
        </div>
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 p-4 rounded-xl mt-4">
          <p className="text-yellow-800 dark:text-yellow-200 text-sm mb-0">
            <strong>Note:</strong> When <code>unstyled</code> is true and no
            classNames are provided for a given section, that section receives an
            empty class string. Make sure you supply classes for every section
            you want visible.
          </p>
        </div>
      </section>

      {/* ── resolveClass utility ── */}
      <section id="resolve-class" className="mb-8">
        <h2 className="text-2xl font-bold text-foreground mt-12 mb-4">How It Works &mdash; The resolveClass Utility</h2>
        <p className="mb-4 text-foreground">
          Under the hood, every component calls a small helper function called{' '}
          <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">resolveClass</code>{' '}
          for each rendered element. The logic is straightforward:
        </p>
        <div className="bg-card border border-border rounded-xl p-4 overflow-x-auto">
          <pre className="text-foreground"><code>{`export function resolveClass(
  defaultClass: string,
  override?: string,
  unstyled?: boolean
): string {
  if (unstyled) return override || '';
  if (override) return override;
  return defaultClass;
}`}</code></pre>
        </div>
        <div className="mt-4 space-y-2 text-sm">
          <div className="flex items-start gap-2">
            <span className="font-mono bg-card border border-border px-2 py-0.5 rounded shrink-0 text-foreground">unstyled + override</span>
            <span className="text-muted-foreground">&rarr; Uses only the override class</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="font-mono bg-card border border-border px-2 py-0.5 rounded shrink-0 text-foreground">unstyled, no override</span>
            <span className="text-muted-foreground">&rarr; Returns an empty string (no styling at all)</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="font-mono bg-card border border-border px-2 py-0.5 rounded shrink-0 text-foreground">override only</span>
            <span className="text-muted-foreground">&rarr; Replaces the default with the override</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="font-mono bg-card border border-border px-2 py-0.5 rounded shrink-0 text-foreground">neither</span>
            <span className="text-muted-foreground">&rarr; Uses the built-in default class</span>
          </div>
        </div>
      </section>

      {/* ── Bootstrap example ── */}
      <section id="bootstrap-example" className="mb-8">
        <h2 className="text-2xl font-bold text-foreground mt-12 mb-4">Example: Bootstrap</h2>
        <p className="mb-4 text-foreground">
          If your project uses Bootstrap, enable unstyled mode and map
          Bootstrap&apos;s utility and component classes through the classNames
          prop:
        </p>
        <div className="bg-card border border-border rounded-xl p-4 overflow-x-auto">
          <pre className="text-foreground"><code>{`import { ConsentBanner } from '@tantainnovative/ndpr-toolkit';

<ConsentBanner
  options={consentOptions}
  onSave={handleSave}
  unstyled={true}
  classNames={{
    root: 'fixed-bottom bg-dark text-white p-4 shadow-lg',
    container: 'container',
    title: 'h5 mb-2',
    description: 'small text-light mb-3',
    optionsList: 'list-unstyled mb-3',
    optionItem: 'form-check mb-2',
    optionCheckbox: 'form-check-input',
    optionLabel: 'form-check-label',
    optionDescription: 'form-text text-muted',
    buttonGroup: 'd-flex gap-2',
    acceptButton: 'btn btn-success',
    rejectButton: 'btn btn-outline-light',
    customizeButton: 'btn btn-link text-light',
    saveButton: 'btn btn-primary',
  }}
/>`}</code></pre>
        </div>
      </section>

      {/* ── CSS Modules example ── */}
      <section id="css-modules-example" className="mb-8">
        <h2 className="text-2xl font-bold text-foreground mt-12 mb-4">Example: CSS Modules</h2>
        <p className="mb-4 text-foreground">
          CSS Modules generate unique class names at build time, making them a
          great choice for scoped, collision-free styles. Pass the imported
          styles directly to classNames:
        </p>
        <div className="bg-card border border-border rounded-xl p-4 overflow-x-auto mb-4">
          <pre className="text-foreground"><code>{`/* consent-banner.module.css */
.root {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: #1a1a2e;
  color: #eee;
  padding: 1.5rem;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.3);
}

.title {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.acceptButton {
  background: #4caf50;
  color: white;
  border: none;
  padding: 0.5rem 1.5rem;
  border-radius: 4px;
  cursor: pointer;
}

.rejectButton {
  background: transparent;
  color: #ccc;
  border: 1px solid #ccc;
  padding: 0.5rem 1.5rem;
  border-radius: 4px;
  cursor: pointer;
}`}</code></pre>
        </div>
        <div className="bg-card border border-border rounded-xl p-4 overflow-x-auto">
          <pre className="text-foreground"><code>{`import { ConsentBanner } from '@tantainnovative/ndpr-toolkit';
import styles from './consent-banner.module.css';

<ConsentBanner
  options={consentOptions}
  onSave={handleSave}
  unstyled={true}
  classNames={{
    root: styles.root,
    title: styles.title,
    acceptButton: styles.acceptButton,
    rejectButton: styles.rejectButton,
  }}
/>`}</code></pre>
        </div>
      </section>

      {/* ── Vanilla CSS example ── */}
      <section id="vanilla-css-example" className="mb-8">
        <h2 className="text-2xl font-bold text-foreground mt-12 mb-4">Example: Vanilla CSS</h2>
        <p className="mb-4 text-foreground">
          Using a plain stylesheet works the same way. Import the stylesheet in
          your app entry point and pass class name strings through the
          classNames prop:
        </p>
        <div className="bg-card border border-border rounded-xl p-4 overflow-x-auto mb-4">
          <pre className="text-foreground"><code>{`/* styles/consent.css */
.consent-banner {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: #fff;
  border-top: 2px solid #e0e0e0;
  padding: 1.5rem 2rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  z-index: 1000;
}

.consent-banner__title {
  font-size: 1.1rem;
  font-weight: 700;
}

.consent-banner__btn--accept {
  background: #2563eb;
  color: #fff;
  border: none;
  padding: 0.6rem 1.4rem;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
}

.consent-banner__btn--reject {
  background: transparent;
  color: #555;
  border: 1px solid #ccc;
  padding: 0.6rem 1.4rem;
  border-radius: 6px;
  cursor: pointer;
}`}</code></pre>
        </div>
        <div className="bg-card border border-border rounded-xl p-4 overflow-x-auto">
          <pre className="text-foreground"><code>{`import { ConsentBanner } from '@tantainnovative/ndpr-toolkit';
import './styles/consent.css';

<ConsentBanner
  options={consentOptions}
  onSave={handleSave}
  unstyled={true}
  classNames={{
    root: 'consent-banner',
    title: 'consent-banner__title',
    acceptButton: 'consent-banner__btn--accept',
    rejectButton: 'consent-banner__btn--reject',
  }}
/>`}</code></pre>
        </div>
      </section>

      {/* ── classNames Reference Table ── */}
      <section id="classnames-reference" className="mb-8">
        <h2 className="text-2xl font-bold text-foreground mt-12 mb-4">classNames Reference</h2>
        <p className="mb-4 text-foreground">
          The table below lists every component that supports the{' '}
          <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">classNames</code> and{' '}
          <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">unstyled</code> props, along with
          every available key from its <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">ClassNames</code> interface.
          These keys map directly to the exported TypeScript interfaces in the component source files.
        </p>

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm border border-border">
            <thead>
              <tr className="bg-muted">
                <th className="px-4 py-3 text-left font-semibold text-foreground border-b border-border whitespace-nowrap">Component</th>
                <th className="px-4 py-3 text-left font-semibold text-foreground border-b border-border whitespace-nowrap">Keys</th>
                <th className="px-4 py-3 text-left font-semibold text-foreground border-b border-border">classNames Keys</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {/* ── Consent Management ── */}
              <tr className="bg-muted/30">
                <td colSpan={3} className="px-4 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Consent Management
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-medium text-foreground align-top whitespace-nowrap">ConsentBanner</td>
                <td className="px-4 py-3 text-foreground align-top text-center">14</td>
                <td className="px-4 py-3 text-foreground">
                  <code className="text-xs">root, container, title, description, optionsList, optionItem, optionCheckbox, optionLabel, optionDescription, buttonGroup, acceptButton, rejectButton, customizeButton, saveButton</code>
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-medium text-foreground align-top whitespace-nowrap">ConsentManager</td>
                <td className="px-4 py-3 text-foreground align-top text-center">9</td>
                <td className="px-4 py-3 text-foreground">
                  <code className="text-xs">root, header, title, description, optionsList, optionItem, toggle, saveButton, resetButton</code>
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-medium text-foreground align-top whitespace-nowrap">ConsentStorage</td>
                <td className="px-4 py-3 text-foreground align-top text-center">1</td>
                <td className="px-4 py-3 text-foreground">
                  <code className="text-xs">root</code>
                </td>
              </tr>

              {/* ── Data Subject Rights (DSR) ── */}
              <tr className="bg-muted/30">
                <td colSpan={3} className="px-4 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Data Subject Rights (DSR)
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-medium text-foreground align-top whitespace-nowrap">DSRRequestForm</td>
                <td className="px-4 py-3 text-foreground align-top text-center">11</td>
                <td className="px-4 py-3 text-foreground">
                  <code className="text-xs">root, title, description, form, fieldGroup, label, input, select, textarea, submitButton, successMessage</code>
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-medium text-foreground align-top whitespace-nowrap">DSRDashboard</td>
                <td className="px-4 py-3 text-foreground align-top text-center">8</td>
                <td className="px-4 py-3 text-foreground">
                  <code className="text-xs">root, header, title, filters, requestList, requestItem, statusBadge, detailPanel</code>
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-medium text-foreground align-top whitespace-nowrap">DSRTracker</td>
                <td className="px-4 py-3 text-foreground align-top text-center">9</td>
                <td className="px-4 py-3 text-foreground">
                  <code className="text-xs">root, header, title, stats, statCard, table, tableHeader, tableRow, statusBadge</code>
                </td>
              </tr>

              {/* ── DPIA ── */}
              <tr className="bg-muted/30">
                <td colSpan={3} className="px-4 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Data Protection Impact Assessment (DPIA)
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-medium text-foreground align-top whitespace-nowrap">DPIAQuestionnaire</td>
                <td className="px-4 py-3 text-foreground align-top text-center">15</td>
                <td className="px-4 py-3 text-foreground">
                  <code className="text-xs">root, header, title, section, sectionTitle, question, questionText, guidance, input, radioGroup, radioOption, navigation, nextButton, prevButton, progressBar</code>
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-medium text-foreground align-top whitespace-nowrap">DPIAReport</td>
                <td className="px-4 py-3 text-foreground align-top text-center">10</td>
                <td className="px-4 py-3 text-foreground">
                  <code className="text-xs">root, header, title, summary, riskBadge, riskTable, riskRow, recommendation, conclusion, printButton</code>
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-medium text-foreground align-top whitespace-nowrap">StepIndicator</td>
                <td className="px-4 py-3 text-foreground align-top text-center">7</td>
                <td className="px-4 py-3 text-foreground">
                  <code className="text-xs">root, step, stepActive, stepCompleted, stepPending, connector, label</code>
                </td>
              </tr>

              {/* ── Breach Notification ── */}
              <tr className="bg-muted/30">
                <td colSpan={3} className="px-4 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Breach Notification
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-medium text-foreground align-top whitespace-nowrap">BreachReportForm</td>
                <td className="px-4 py-3 text-foreground align-top text-center">10</td>
                <td className="px-4 py-3 text-foreground">
                  <code className="text-xs">root, title, form, fieldGroup, label, input, select, textarea, submitButton, notice</code>
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-medium text-foreground align-top whitespace-nowrap">BreachRiskAssessment</td>
                <td className="px-4 py-3 text-foreground align-top text-center">8</td>
                <td className="px-4 py-3 text-foreground">
                  <code className="text-xs">root, header, title, slider, riskBadge, riskScore, notificationStatus, submitButton</code>
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-medium text-foreground align-top whitespace-nowrap">BreachNotificationManager</td>
                <td className="px-4 py-3 text-foreground align-top text-center">9</td>
                <td className="px-4 py-3 text-foreground">
                  <code className="text-xs">root, header, title, breachList, breachItem, statusBadge, timeline, timelineStep, detailPanel</code>
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-medium text-foreground align-top whitespace-nowrap">RegulatoryReportGenerator</td>
                <td className="px-4 py-3 text-foreground align-top text-center">9</td>
                <td className="px-4 py-3 text-foreground">
                  <code className="text-xs">root, header, title, reportPreview, field, fieldLabel, fieldValue, generateButton, downloadButton</code>
                </td>
              </tr>

              {/* ── Privacy Policy ── */}
              <tr className="bg-muted/30">
                <td colSpan={3} className="px-4 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Privacy Policy Generator
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-medium text-foreground align-top whitespace-nowrap">PolicyGenerator</td>
                <td className="px-4 py-3 text-foreground align-top text-center">10</td>
                <td className="px-4 py-3 text-foreground">
                  <code className="text-xs">root, header, title, description, sectionList, sectionItem, form, input, generateButton, complianceNotice</code>
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-medium text-foreground align-top whitespace-nowrap">PolicyPreview</td>
                <td className="px-4 py-3 text-foreground align-top text-center">9</td>
                <td className="px-4 py-3 text-foreground">
                  <code className="text-xs">root, header, title, description, content, section, sectionTitle, sectionContent, complianceNotice</code>
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-medium text-foreground align-top whitespace-nowrap">PolicyExporter</td>
                <td className="px-4 py-3 text-foreground align-top text-center">9</td>
                <td className="px-4 py-3 text-foreground">
                  <code className="text-xs">root, header, title, description, formatSelector, formatOption, exportButton, complianceNotice, preview</code>
                </td>
              </tr>

              {/* ── Lawful Basis ── */}
              <tr className="bg-muted/30">
                <td colSpan={3} className="px-4 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Lawful Basis Tracker
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-medium text-foreground align-top whitespace-nowrap">LawfulBasisTracker</td>
                <td className="px-4 py-3 text-foreground align-top text-center">15</td>
                <td className="px-4 py-3 text-foreground">
                  <code className="text-xs">root, header, title, summary, summaryCard, table, tableHeader, tableRow, form, input, select, submitButton, statusBadge, complianceScore, gapAlert</code>
                </td>
              </tr>

              {/* ── Cross-Border Transfer ── */}
              <tr className="bg-muted/30">
                <td colSpan={3} className="px-4 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Cross-Border Transfer
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-medium text-foreground align-top whitespace-nowrap">CrossBorderTransferManager</td>
                <td className="px-4 py-3 text-foreground align-top text-center">15</td>
                <td className="px-4 py-3 text-foreground">
                  <code className="text-xs">root, header, title, summary, summaryCard, transferList, transferItem, form, input, select, submitButton, riskBadge, statusBadge, detailPanel, approvalStatus</code>
                </td>
              </tr>

              {/* ── ROPA ── */}
              <tr className="bg-muted/30">
                <td colSpan={3} className="px-4 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Record of Processing Activities (ROPA)
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-medium text-foreground align-top whitespace-nowrap">ROPAManager</td>
                <td className="px-4 py-3 text-foreground align-top text-center">16</td>
                <td className="px-4 py-3 text-foreground">
                  <code className="text-xs">root, header, title, orgInfo, summary, summaryCard, table, tableHeader, tableRow, form, input, select, submitButton, statusBadge, exportButton, complianceGap</code>
                </td>
              </tr>

              {/* ── Total ── */}
              <tr className="bg-muted font-semibold">
                <td className="px-4 py-3 text-foreground">Total (19 components)</td>
                <td className="px-4 py-3 text-foreground text-center">169</td>
                <td className="px-4 py-3 text-muted-foreground text-xs">
                  All keys listed above are the exact keys from each component&apos;s exported ClassNames TypeScript interface
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 p-4 rounded-xl mt-4">
          <p className="text-blue-700 dark:text-blue-300 text-sm mb-0">
            <strong>TypeScript integration:</strong> Each component exports its ClassNames interface
            (e.g. <code className="bg-blue-100 dark:bg-blue-900 px-1 rounded">ConsentBannerClassNames</code>,{' '}
            <code className="bg-blue-100 dark:bg-blue-900 px-1 rounded">DSRRequestFormClassNames</code>) so your
            editor provides autocomplete for every key. Import them from the same path as the component.
          </p>
        </div>
      </section>

      {/* ── Best Practices ── */}
      <section id="best-practices" className="mb-8">
        <h2 className="text-2xl font-bold text-foreground mt-12 mb-4">Best Practices</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="border border-border rounded-xl bg-card p-6">
            <h3 className="font-bold text-lg text-foreground mb-2">Start with Defaults</h3>
            <p className="text-muted-foreground text-sm">
              Begin with the built-in Tailwind styles and only override what
              does not match your brand. This minimises the amount of CSS you
              maintain and ensures future improvements carry over.
            </p>
          </div>

          <div className="border border-border rounded-xl bg-card p-6">
            <h3 className="font-bold text-lg text-foreground mb-2">Override, Don&apos;t Fight</h3>
            <p className="text-muted-foreground text-sm">
              If only a handful of sections need changes, use classNames
              without unstyled. This keeps the rest of the component looking
              good with zero effort.
            </p>
          </div>

          <div className="border border-border rounded-xl bg-card p-6">
            <h3 className="font-bold text-lg text-foreground mb-2">Use Unstyled for Full Control</h3>
            <p className="text-muted-foreground text-sm">
              If your project relies on a different CSS framework (Bootstrap,
              Bulma, Material, etc.), enable unstyled mode to prevent clashes
              between the toolkit&apos;s Tailwind classes and your own.
            </p>
          </div>

          <div className="border border-border rounded-xl bg-card p-6">
            <h3 className="font-bold text-lg text-foreground mb-2">Keep Accessibility in Mind</h3>
            <p className="text-muted-foreground text-sm">
              When restyling components, preserve sufficient colour contrast,
              focus indicators, and font sizes. The default styles meet WCAG
              AA contrast requirements &mdash; make sure your overrides do
              too.
            </p>
          </div>

          <div className="border border-border rounded-xl bg-card p-6">
            <h3 className="font-bold text-lg text-foreground mb-2">Centralise Overrides</h3>
            <p className="text-muted-foreground text-sm">
              If you use the same classNames across multiple instances, extract
              them into a shared constant or theme object so changes propagate
              everywhere at once.
            </p>
          </div>

          <div className="border border-border rounded-xl bg-card p-6">
            <h3 className="font-bold text-lg text-foreground mb-2">Test in Both Modes</h3>
            <p className="text-muted-foreground text-sm">
              If your app supports dark mode, verify that your custom
              classNames look correct in both light and dark themes.
            </p>
          </div>
        </div>
      </section>

      {/* ── Shared Theme Example ── */}
      <section id="shared-theme" className="mb-8">
        <h2 className="text-2xl font-bold text-foreground mt-12 mb-4">Advanced: Shared Theme Object</h2>
        <p className="mb-4 text-foreground">
          For larger applications, you may want to centralise your style
          overrides so every toolkit component shares a consistent look:
        </p>
        <div className="bg-card border border-border rounded-xl p-4 overflow-x-auto">
          <pre className="text-foreground"><code>{`// theme/ndpr-theme.ts
export const ndprTheme = {
  consentBanner: {
    root: 'fixed inset-x-0 bottom-0 bg-brand-900 text-white p-6 shadow-2xl z-50',
    acceptButton: 'bg-brand-500 hover:bg-brand-600 text-white font-semibold py-2 px-6 rounded-lg',
    rejectButton: 'border border-white/30 text-white py-2 px-6 rounded-lg hover:bg-white/10',
  },
  dsrRequestForm: {
    root: 'bg-white dark:bg-gray-800 rounded-xl shadow p-6',
    submitButton: 'bg-brand-500 hover:bg-brand-600 text-white font-semibold py-2 px-6 rounded-lg',
  },
  breachReportForm: {
    root: 'bg-white dark:bg-gray-800 rounded-xl shadow p-6',
    submitButton: 'bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-6 rounded-lg',
  },
};

// Then use across your app:
import { ndprTheme } from '@/theme/ndpr-theme';

<ConsentBanner classNames={ndprTheme.consentBanner} ... />
<DSRRequestForm classNames={ndprTheme.dsrRequestForm} ... />
<BreachReportForm classNames={ndprTheme.breachReportForm} ... />`}</code></pre>
        </div>
      </section>

      {/* ── Additional Resources ── */}
      <section id="resources" className="mb-8">
        <h2 className="text-2xl font-bold text-foreground mt-12 mb-4">Additional Resources</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="border border-border rounded-xl bg-card p-4">
            <h3 className="font-medium text-foreground mb-2">Component Documentation</h3>
            <p className="text-muted-foreground text-sm mb-3">
              Full API reference for every component, including all classNames
              interfaces and props.
            </p>
            <Link
              href="/docs/components"
              className="inline-flex items-center px-3 py-1.5 text-sm border border-border rounded-md text-foreground hover:bg-muted transition-colors"
            >
              Browse Components
            </Link>
          </div>
          <div className="border border-border rounded-xl bg-card p-4">
            <h3 className="font-medium text-foreground mb-2">GitHub Source</h3>
            <p className="text-muted-foreground text-sm mb-3">
              View the resolveClass utility and component source code for the
              exact default class values.
            </p>
            <a
              href="https://github.com/mr-tanta/ndpr-toolkit"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-3 py-1.5 text-sm border border-border rounded-md text-foreground hover:bg-muted transition-colors"
            >
              View on GitHub
            </a>
          </div>
        </div>
      </section>
    </DocLayout>
  );
}
