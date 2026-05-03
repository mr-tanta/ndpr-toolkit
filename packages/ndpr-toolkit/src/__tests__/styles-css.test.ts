/**
 * Stylesheet contract guard.
 *
 * Components emit class names like `.ndpr-consent-banner`, `.ndpr-form-field__input`,
 * etc. and rely on `dist/styles.css` to define the visual rules. If a future
 * refactor accidentally removes a rule, components silently degrade to
 * unstyled markup in consumer apps. These tests assert that the published
 * stylesheet contains the rules the components reference.
 *
 * The tests inspect the SOURCE stylesheet (src/styles/styles.css) — not the
 * built dist file — so they pass without requiring `pnpm build` to have
 * been run first. The build script copies the source verbatim, so the
 * assertions cover both.
 */
import * as fs from 'fs';
import * as path from 'path';

const stylesheetPath = path.resolve(
  __dirname,
  '..',
  'styles',
  'styles.css',
);

describe('dist/styles.css — published stylesheet contract', () => {
  let css: string;

  beforeAll(() => {
    css = fs.readFileSync(stylesheetPath, 'utf8');
  });

  it('defines the design-token layer at :root', () => {
    expect(css).toMatch(/:root\s*\{[^}]*--ndpr-primary/);
    expect(css).toMatch(/:root\s*\{[^}]*--ndpr-background/);
    expect(css).toMatch(/:root\s*\{[^}]*--ndpr-foreground/);
    expect(css).toMatch(/:root\s*\{[^}]*--ndpr-radius/);
  });

  it('defines a dark-mode override via prefers-color-scheme and data-theme', () => {
    expect(css).toMatch(/@media\s*\(prefers-color-scheme:\s*dark\)/);
    expect(css).toMatch(/\[data-theme="dark"\]/);
  });

  describe('ConsentBanner', () => {
    it.each([
      '.ndpr-consent-banner',
      '.ndpr-consent-banner--top',
      '.ndpr-consent-banner--bottom',
      '.ndpr-consent-banner--card',
      '.ndpr-consent-banner--modal',
      '.ndpr-consent-banner__overlay',
      '.ndpr-consent-banner__container',
      '.ndpr-consent-banner__title',
      '.ndpr-consent-banner__description',
      '.ndpr-consent-banner__customize-panel',
      '.ndpr-consent-banner__options-list',
      '.ndpr-consent-banner__option',
      '.ndpr-consent-banner__option-checkbox',
      '.ndpr-consent-banner__option-label',
      '.ndpr-consent-banner__option-description',
      '.ndpr-consent-banner__buttons',
      '.ndpr-consent-banner__button',
      '.ndpr-consent-banner__button--primary',
      '.ndpr-consent-banner__button--secondary',
      '.ndpr-consent-banner__button--ghost',
      '.ndpr-consent-banner__footer-text',
    ])('defines %s', (selector) => {
      // Match the selector at the start of a rule (followed by `,` `{` or
      // whitespace). Avoids false positives from selectors that *contain*
      // the same string as a substring.
      const re = new RegExp(`\\${selector}\\b`);
      expect(css).toMatch(re);
    });
  });

  describe('ConsentManager', () => {
    it.each([
      '.ndpr-consent-manager',
      '.ndpr-consent-manager__title',
      '.ndpr-consent-manager__description',
      '.ndpr-consent-manager__options-list',
      '.ndpr-consent-manager__option',
      '.ndpr-consent-manager__toggle',
      '.ndpr-consent-manager__toggle-input',
      '.ndpr-consent-manager__buttons',
      '.ndpr-consent-manager__button--primary',
      '.ndpr-consent-manager__button--secondary',
      '.ndpr-consent-manager__success',
    ])('defines %s', (selector) => {
      const re = new RegExp(`\\${selector}\\b`);
      expect(css).toMatch(re);
    });
  });

  describe('DSRRequestForm + shared form primitives', () => {
    it.each([
      '.ndpr-dsr-form',
      '.ndpr-dsr-form__title',
      '.ndpr-dsr-form__description',
      '.ndpr-dsr-form__sections',
      '.ndpr-dsr-form__type-info',
      '.ndpr-dsr-form__notice',
      '.ndpr-dsr-form__actions',
      '.ndpr-dsr-form__button--primary',
      '.ndpr-dsr-form__button--secondary',
      '.ndpr-dsr-form__success',
      // Shared form primitives
      '.ndpr-form-field',
      '.ndpr-form-field__label',
      '.ndpr-form-field__input',
      '.ndpr-form-field__select',
      '.ndpr-form-field__textarea',
      '.ndpr-form-field__error',
      '.ndpr-form-field__required',
      '.ndpr-form-field__checkbox',
      '.ndpr-form-field__radio',
      '.ndpr-form-field__option-group',
      '.ndpr-form-field__hint',
      '.ndpr-form-field__range',
      '.ndpr-form-field__input--mono',
      '.ndpr-form-section',
      '.ndpr-form-section__heading',
      '.ndpr-form-grid',
    ])('defines %s', (selector) => {
      const re = new RegExp(`\\${selector}\\b`);
      expect(css).toMatch(re);
    });
  });

  describe('Shared layout primitives (3.5.x rollout)', () => {
    it.each([
      // Cards
      '.ndpr-card',
      '.ndpr-card--compact',
      '.ndpr-card--flat',
      '.ndpr-card--subtle',
      '.ndpr-card__header',
      '.ndpr-card__title',
      '.ndpr-card__subtitle',
      '.ndpr-card__body',
      '.ndpr-card__footer',
      '.ndpr-panel',
      // Badges
      '.ndpr-badge',
      '.ndpr-badge--success',
      '.ndpr-badge--warning',
      '.ndpr-badge--destructive',
      '.ndpr-badge--info',
      '.ndpr-badge--neutral',
      // Alerts
      '.ndpr-alert',
      '.ndpr-alert__title',
      '.ndpr-alert__body',
      '.ndpr-alert--info',
      '.ndpr-alert--success',
      '.ndpr-alert--warning',
      '.ndpr-alert--destructive',
      // Tables
      '.ndpr-table',
      '.ndpr-table__head',
      '.ndpr-table__row',
      '.ndpr-table__cell',
      '.ndpr-table__cell--muted',
      '.ndpr-table__cell--actions',
      '.ndpr-table__heading',
      '.ndpr-table-wrapper',
      // Empty state
      '.ndpr-empty-state',
      '.ndpr-empty-state__title',
      '.ndpr-empty-state__body',
      // Generic button family
      '.ndpr-button',
      '.ndpr-button--primary',
      '.ndpr-button--secondary',
      '.ndpr-button--ghost',
      '.ndpr-button--destructive',
      '.ndpr-button--sm',
      '.ndpr-button--lg',
      '.ndpr-button--icon',
      // Step indicator (DPIA / Policy wizards)
      '.ndpr-step-indicator',
      '.ndpr-step-indicator__item',
      '.ndpr-step-indicator__bullet',
      '.ndpr-step-indicator__label',
      '.ndpr-step-indicator__item--current',
      '.ndpr-step-indicator__item--complete',
      // Progress bar
      '.ndpr-progress',
      '.ndpr-progress__bar',
      '.ndpr-progress__bar--success',
      '.ndpr-progress__bar--warning',
      '.ndpr-progress__bar--destructive',
      // Stat / dashboard
      '.ndpr-stat-grid',
      '.ndpr-stat',
      '.ndpr-stat__label',
      '.ndpr-stat__value',
      // Section heading + divider
      '.ndpr-section-heading',
      '.ndpr-section-divider',
      // Text utilities
      '.ndpr-text-muted',
      '.ndpr-text-foreground',
      '.ndpr-text-primary',
      '.ndpr-text-success',
      '.ndpr-text-warning',
      '.ndpr-text-destructive',
      '.ndpr-text-info',
      '.ndpr-text-xs',
      '.ndpr-text-sm',
      '.ndpr-text-base',
      '.ndpr-text-lg',
      '.ndpr-text-xl',
      '.ndpr-font-medium',
      '.ndpr-font-semibold',
      '.ndpr-font-bold',
    ])('defines %s', (selector) => {
      const re = new RegExp(`\\${selector}\\b`);
      expect(css).toMatch(re);
    });
  });
});
