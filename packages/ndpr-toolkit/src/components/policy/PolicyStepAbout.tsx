import React, { useId } from 'react';
import type { TemplateContext } from '../../types/policy-engine';
import { resolveClass } from '../../utils/styling';

export interface PolicyStepAboutProps {
  context: TemplateContext;
  onUpdateOrg: (updates: Partial<TemplateContext['org']>) => void;
  classNames?: Record<string, string>;
  unstyled?: boolean;
}

const INPUT_CLASS =
  'w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 ndpr-text-foreground focus:outline-none focus:ring-2 focus:ring-[rgb(var(--ndpr-ring))] text-sm';

const LABEL_CLASS = 'block text-sm font-medium ndpr-text-muted mb-1';

interface FieldProps {
  id: string;
  label: string;
  required?: boolean;
  description?: string;
  children: React.ReactNode;
  classNames?: Record<string, string>;
  unstyled?: boolean;
}

const Field: React.FC<FieldProps> = ({ id, label, required, description, children, classNames, unstyled }) => {
  const descId = description ? `${id}-desc` : undefined;
  return (
  <div className={resolveClass('flex flex-col', classNames?.field, unstyled)}>
    <label htmlFor={id} className={resolveClass(LABEL_CLASS, classNames?.label, unstyled)}>
      {label}
      {required && (
        <span className="text-red-500 ml-0.5" aria-hidden="true">
          *
        </span>
      )}
    </label>
    {description && (
      <p id={descId} className="text-xs ndpr-text-muted mb-1">
        {description}
      </p>
    )}
    {children}
  </div>
  );
};

export const PolicyStepAbout: React.FC<PolicyStepAboutProps> = ({
  context,
  onUpdateOrg,
  classNames,
  unstyled,
}) => {
  const instanceId = useId();
  const org = context.org;

  return (
    <div
      data-ndpr-component="policy-step-about"
      className={resolveClass('ndpr-form-section', classNames?.root, unstyled)}
    >
      <div>
        <h2 className={resolveClass('ndpr-section-heading', classNames?.heading, unstyled)}>
          Organisation Details
        </h2>
        <p className={resolveClass('ndpr-form-field__hint', classNames?.subheading, unstyled)}>
          Tell us about your organisation. Fields marked <span className="text-red-500" aria-hidden="true">*</span> are required.
        </p>
      </div>

      <div
        className={resolveClass(
          'grid grid-cols-1 md:grid-cols-2 gap-4',
          classNames?.grid,
          unstyled,
        )}
      >
        {/* Organisation Name */}
        <Field id={`${instanceId}-org-name`} label="Organisation Name" required classNames={classNames} unstyled={unstyled}>
          <input
            id={`${instanceId}-org-name`}
            type="text"
            value={org.name}
            onChange={(e) => onUpdateOrg({ name: e.target.value })}
            placeholder="Acme Corporation"
            className={resolveClass(INPUT_CLASS, classNames?.input, unstyled)}
            aria-required="true"
          />
        </Field>

        {/* Website */}
        <Field id={`${instanceId}-website`} label="Website" required classNames={classNames} unstyled={unstyled}>
          <input
            id={`${instanceId}-website`}
            type="url"
            value={org.website}
            onChange={(e) => onUpdateOrg({ website: e.target.value })}
            placeholder="https://example.com"
            className={resolveClass(INPUT_CLASS, classNames?.input, unstyled)}
            aria-required="true"
          />
        </Field>

        {/* Privacy Email */}
        <Field id={`${instanceId}-privacy-email`} label="Privacy Contact Email" required classNames={classNames} unstyled={unstyled}>
          <input
            id={`${instanceId}-privacy-email`}
            type="email"
            value={org.privacyEmail}
            onChange={(e) => onUpdateOrg({ privacyEmail: e.target.value })}
            placeholder="privacy@example.com"
            className={resolveClass(INPUT_CLASS, classNames?.input, unstyled)}
            aria-required="true"
          />
        </Field>

        {/* Industry */}
        <Field id={`${instanceId}-industry`} label="Industry" classNames={classNames} unstyled={unstyled}>
          <select
            id={`${instanceId}-industry`}
            value={org.industry}
            onChange={(e) => onUpdateOrg({ industry: e.target.value as TemplateContext['org']['industry'] })}
            className={resolveClass(INPUT_CLASS, classNames?.select, unstyled)}
          >
            <option value="fintech">Fintech</option>
            <option value="healthcare">Healthcare</option>
            <option value="ecommerce">E-commerce</option>
            <option value="saas">SaaS</option>
            <option value="education">Education</option>
            <option value="government">Government</option>
            <option value="other">Other</option>
          </select>
        </Field>

        {/* DPO Name */}
        <Field id={`${instanceId}-dpo-name`} label="Data Protection Officer (DPO) Name" classNames={classNames} unstyled={unstyled}>
          <input
            id={`${instanceId}-dpo-name`}
            type="text"
            value={org.dpoName ?? ''}
            onChange={(e) => onUpdateOrg({ dpoName: e.target.value })}
            placeholder="Jane Smith"
            className={resolveClass(INPUT_CLASS, classNames?.input, unstyled)}
          />
        </Field>

        {/* DPO Email */}
        <Field id={`${instanceId}-dpo-email`} label="DPO Email" classNames={classNames} unstyled={unstyled}>
          <input
            id={`${instanceId}-dpo-email`}
            type="email"
            value={org.dpoEmail ?? ''}
            onChange={(e) => onUpdateOrg({ dpoEmail: e.target.value })}
            placeholder="dpo@example.com"
            className={resolveClass(INPUT_CLASS, classNames?.input, unstyled)}
          />
        </Field>

        {/* Address */}
        <Field id={`${instanceId}-address`} label="Registered Address" classNames={classNames} unstyled={unstyled}>
          <input
            id={`${instanceId}-address`}
            type="text"
            value={org.address ?? ''}
            onChange={(e) => onUpdateOrg({ address: e.target.value })}
            placeholder="1 Victoria Island, Lagos, Nigeria"
            className={resolveClass(INPUT_CLASS, classNames?.input, unstyled)}
          />
        </Field>

        {/* Org Size */}
        <Field id={`${instanceId}-org-size`} label="Organisation Size" classNames={classNames} unstyled={unstyled}>
          <select
            id={`${instanceId}-org-size`}
            value={org.orgSize}
            onChange={(e) => onUpdateOrg({ orgSize: e.target.value as TemplateContext['org']['orgSize'] })}
            className={resolveClass(INPUT_CLASS, classNames?.select, unstyled)}
          >
            <option value="startup">Startup (1–50 employees)</option>
            <option value="midsize">Mid-size (51–500 employees)</option>
            <option value="enterprise">Enterprise (500+ employees)</option>
          </select>
        </Field>

        {/* Country */}
        <Field id={`${instanceId}-country`} label="Country of Operation" classNames={classNames} unstyled={unstyled}>
          <input
            id={`${instanceId}-country`}
            type="text"
            value={org.country}
            onChange={(e) => onUpdateOrg({ country: e.target.value })}
            placeholder="Nigeria"
            className={resolveClass(INPUT_CLASS, classNames?.input, unstyled)}
          />
        </Field>
      </div>
    </div>
  );
};

export default PolicyStepAbout;
