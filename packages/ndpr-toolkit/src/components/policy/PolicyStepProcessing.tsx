import React, { useState, useId } from 'react';
import type { TemplateContext, ProcessingPurpose } from '../../types/policy-engine';
import { resolveClass } from '../../utils/styling';

export interface PolicyStepProcessingProps {
  context: TemplateContext;
  onTogglePurpose: (purpose: string) => void;
  onUpdateContext: (updates: Partial<TemplateContext>) => void;
  onAddProcessor: (p: { name: string; purpose: string; country: string }) => void;
  onRemoveProcessor: (index: number) => void;
  classNames?: Record<string, string>;
  unstyled?: boolean;
}

const PURPOSES: { value: ProcessingPurpose; label: string; description: string }[] = [
  {
    value: 'service_delivery',
    label: 'Service Delivery',
    description: 'Processing required to deliver the core product or service.',
  },
  {
    value: 'marketing',
    label: 'Marketing & Communications',
    description: 'Sending promotional messages, newsletters or offers.',
  },
  {
    value: 'analytics',
    label: 'Analytics & Insights',
    description: 'Analysing usage patterns to improve the product.',
  },
  {
    value: 'research',
    label: 'Research & Development',
    description: 'Using data to develop new features or products.',
  },
  {
    value: 'legal_compliance',
    label: 'Legal Compliance',
    description: 'Meeting statutory, regulatory or contractual obligations.',
  },
  {
    value: 'fraud_prevention',
    label: 'Fraud Prevention & Security',
    description: 'Detecting and preventing fraudulent activity.',
  },
];

const INPUT_CLASS =
  'w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[rgb(var(--ndpr-ring))] text-sm';

const SECTION_CLASS =
  'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-4';

type ToggleProps = {
  id: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
};

const Toggle: React.FC<ToggleProps> = ({ id, checked, onChange }) => (
  <button
    id={id}
    type="button"
    role="switch"
    aria-checked={checked}
    onClick={() => onChange(!checked)}
    className={[
      'relative inline-flex h-6 w-11 flex-shrink-0 rounded-full border-2 border-transparent cursor-pointer transition-colors focus:outline-none focus:ring-2 focus:ring-[rgb(var(--ndpr-ring))]',
      checked ? 'bg-[rgb(var(--ndpr-primary))]' : 'bg-gray-200 dark:bg-gray-600',
    ].join(' ')}
  >
    <span
      aria-hidden="true"
      className={[
        'pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition-transform',
        checked ? 'translate-x-5' : 'translate-x-0',
      ].join(' ')}
    />
  </button>
);

export const PolicyStepProcessing: React.FC<PolicyStepProcessingProps> = ({
  context,
  onTogglePurpose,
  onUpdateContext,
  onAddProcessor,
  onRemoveProcessor,
  classNames,
  unstyled,
}) => {
  const instanceId = useId();
  const [processorForm, setProcessorForm] = useState({ name: '', purpose: '', country: '' });
  const [showProcessorForm, setShowProcessorForm] = useState(false);

  const handleAddProcessor = () => {
    const { name, purpose, country } = processorForm;
    if (!name.trim() || !purpose.trim() || !country.trim()) return;
    onAddProcessor({ name: name.trim(), purpose: purpose.trim(), country: country.trim() });
    setProcessorForm({ name: '', purpose: '', country: '' });
    setShowProcessorForm(false);
  };

  return (
    <div
      data-ndpr-component="policy-step-processing"
      className={resolveClass('space-y-6', classNames?.root, unstyled)}
    >
      <div>
        <h2 className={resolveClass('text-xl font-semibold text-gray-900 dark:text-gray-100', classNames?.heading, unstyled)}>
          Processing Details
        </h2>
        <p className={resolveClass('text-sm text-gray-500 dark:text-gray-400 mt-1', classNames?.subheading, unstyled)}>
          Define how and why you process personal data.
        </p>
      </div>

      {/* 1. Purposes */}
      <section
        className={resolveClass(SECTION_CLASS, classNames?.section, unstyled)}
        aria-labelledby="purposes-heading"
      >
        <h3
          id="purposes-heading"
          className={resolveClass('text-base font-semibold text-gray-900 dark:text-gray-100', classNames?.sectionTitle, unstyled)}
        >
          Processing Purposes
        </h3>
        <p className={resolveClass('text-sm text-gray-500 dark:text-gray-400', classNames?.sectionDescription, unstyled)}>
          Select all purposes for which you process personal data. At least one is required.
        </p>
        <div className={resolveClass('space-y-3', classNames?.purposeList, unstyled)}>
          {PURPOSES.map((p) => {
            const checked = context.purposes.includes(p.value);
            const purposeId = `${instanceId}-purpose-${p.value}`;
            const purposeDescId = `${instanceId}-purpose-desc-${p.value}`;
            return (
              <label
                key={p.value}
                htmlFor={purposeId}
                className={resolveClass(
                  'flex items-start gap-3 cursor-pointer group',
                  classNames?.purposeItem,
                  unstyled,
                )}
              >
                <input
                  id={purposeId}
                  type="checkbox"
                  checked={checked}
                  onChange={() => onTogglePurpose(p.value)}
                  aria-describedby={purposeDescId}
                  className={resolveClass(
                    'mt-0.5 h-4 w-4 rounded border-gray-300 dark:border-gray-600 text-[rgb(var(--ndpr-primary))] focus:ring-[rgb(var(--ndpr-ring))] cursor-pointer',
                    classNames?.purposeCheckbox,
                    unstyled,
                  )}
                />
                <div>
                  <p className={resolveClass('text-sm font-medium text-gray-900 dark:text-gray-100', classNames?.purposeLabel, unstyled)}>
                    {p.label}
                  </p>
                  <p id={purposeDescId} className={resolveClass('text-xs text-gray-500 dark:text-gray-400', classNames?.purposeDescription, unstyled)}>
                    {p.description}
                  </p>
                </div>
              </label>
            );
          })}
        </div>
      </section>

      {/* 2. Third-party sharing */}
      <section
        className={resolveClass(SECTION_CLASS, classNames?.section, unstyled)}
        aria-labelledby="thirdparty-heading"
      >
        <div className="flex items-center justify-between">
          <h3
            id="thirdparty-heading"
            className={resolveClass('text-base font-semibold text-gray-900 dark:text-gray-100', classNames?.sectionTitle, unstyled)}
          >
            Third-Party Data Sharing
          </h3>
          <Toggle
            id={`${instanceId}-thirdparty-toggle`}
            checked={context.thirdPartyProcessors.length > 0 || showProcessorForm}
            onChange={(val) => {
              if (!val) {
                // Remove all processors
                context.thirdPartyProcessors.forEach((_, i) => onRemoveProcessor(0));
                setShowProcessorForm(false);
              } else {
                setShowProcessorForm(true);
              }
            }}
          />
        </div>

        {(context.thirdPartyProcessors.length > 0 || showProcessorForm) && (
          <div className={resolveClass('space-y-4', classNames?.processorSection, unstyled)}>
            {/* Processor table */}
            {context.thirdPartyProcessors.length > 0 && (
              <div className={resolveClass('overflow-x-auto', classNames?.processorTable, unstyled)}>
                <table className="w-full text-sm">
                  <thead>
                    <tr className={resolveClass('text-left text-xs font-medium text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700', classNames?.tableHeader, unstyled)}>
                      <th className="pb-2 pr-4">Name</th>
                      <th className="pb-2 pr-4">Purpose</th>
                      <th className="pb-2 pr-4">Country</th>
                      <th className="pb-2" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                    {context.thirdPartyProcessors.map((proc, idx) => (
                      <tr key={idx}>
                        <td className={resolveClass('py-2 pr-4 text-gray-900 dark:text-gray-100', classNames?.tableCell, unstyled)}>{proc.name}</td>
                        <td className={resolveClass('py-2 pr-4 text-gray-700 dark:text-gray-300', classNames?.tableCell, unstyled)}>{proc.purpose}</td>
                        <td className={resolveClass('py-2 pr-4 text-gray-700 dark:text-gray-300', classNames?.tableCell, unstyled)}>{proc.country}</td>
                        <td className="py-2">
                          <button
                            type="button"
                            onClick={() => onRemoveProcessor(idx)}
                            className={resolveClass(
                              'text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 text-xs font-medium',
                              classNames?.removeButton,
                              unstyled,
                            )}
                            aria-label={`Remove ${proc.name}`}
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Add processor form */}
            {showProcessorForm ? (
              <div className={resolveClass('grid grid-cols-1 sm:grid-cols-3 gap-3 items-end', classNames?.processorForm, unstyled)}>
                <div>
                  <label htmlFor={`${instanceId}-proc-name`} className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Processor Name</label>
                  <input
                    id={`${instanceId}-proc-name`}
                    type="text"
                    placeholder="Processor name"
                    value={processorForm.name}
                    onChange={(e) => setProcessorForm((f) => ({ ...f, name: e.target.value }))}
                    aria-required="true"
                    className={resolveClass(INPUT_CLASS, classNames?.input, unstyled)}
                  />
                </div>
                <div>
                  <label htmlFor={`${instanceId}-proc-purpose`} className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Purpose</label>
                  <input
                    id={`${instanceId}-proc-purpose`}
                    type="text"
                    placeholder="Purpose"
                    value={processorForm.purpose}
                    onChange={(e) => setProcessorForm((f) => ({ ...f, purpose: e.target.value }))}
                    aria-required="true"
                    className={resolveClass(INPUT_CLASS, classNames?.input, unstyled)}
                  />
                </div>
                <div>
                  <label htmlFor={`${instanceId}-proc-country`} className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Country</label>
                  <input
                    id={`${instanceId}-proc-country`}
                    type="text"
                    placeholder="Country"
                    value={processorForm.country}
                    onChange={(e) => setProcessorForm((f) => ({ ...f, country: e.target.value }))}
                    aria-required="true"
                    className={resolveClass(INPUT_CLASS, classNames?.input, unstyled)}
                  />
                </div>
                <div className="sm:col-span-3 flex gap-2">
                  <button
                    type="button"
                    onClick={handleAddProcessor}
                    className={resolveClass(
                      'px-4 py-2 bg-[rgb(var(--ndpr-primary))] text-[rgb(var(--ndpr-primary-foreground))] rounded-md hover:bg-[rgb(var(--ndpr-primary-hover))] text-sm font-medium',
                      classNames?.addButton,
                      unstyled,
                    )}
                  >
                    Add Processor
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowProcessorForm(false)}
                    className={resolveClass(
                      'px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded-md text-sm',
                      classNames?.cancelButton,
                      unstyled,
                    )}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setShowProcessorForm(true)}
                className={resolveClass(
                  'flex items-center gap-1 text-sm text-[rgb(var(--ndpr-primary))] hover:underline font-medium',
                  classNames?.addLink,
                  unstyled,
                )}
              >
                <span aria-hidden="true">+</span> Add processor
              </button>
            )}
          </div>
        )}
      </section>

      {/* 3. Additional disclosures */}
      <section
        className={resolveClass(SECTION_CLASS, classNames?.section, unstyled)}
        aria-labelledby="disclosures-heading"
      >
        <h3
          id="disclosures-heading"
          className={resolveClass('text-base font-semibold text-gray-900 dark:text-gray-100', classNames?.sectionTitle, unstyled)}
        >
          Additional Disclosures
        </h3>

        <div className={resolveClass('space-y-4', classNames?.disclosureList, unstyled)}>
          {/* Cross-border transfer */}
          <div className={resolveClass('flex items-start justify-between gap-4', classNames?.disclosureItem, unstyled)}>
            <div>
              <p id={`${instanceId}-cross-border-label`} className={resolveClass('text-sm font-medium text-gray-900 dark:text-gray-100', classNames?.disclosureLabel, unstyled)}>
                Cross-border Data Transfers
              </p>
              <p id={`${instanceId}-cross-border-desc`} className={resolveClass('text-xs text-gray-500 dark:text-gray-400 mt-0.5', classNames?.disclosureDescription, unstyled)}>
                Do you transfer personal data outside Nigeria? This triggers NDPA Chapter 6 obligations.
              </p>
            </div>
            <Toggle
              id={`${instanceId}-cross-border-toggle`}
              checked={context.hasCrossBorderTransfer}
              onChange={(val) => onUpdateContext({ hasCrossBorderTransfer: val })}
            />
          </div>

          {/* Automated decisions */}
          <div className={resolveClass('flex items-start justify-between gap-4', classNames?.disclosureItem, unstyled)}>
            <div>
              <p id={`${instanceId}-automated-label`} className={resolveClass('text-sm font-medium text-gray-900 dark:text-gray-100', classNames?.disclosureLabel, unstyled)}>
                Automated Decision-Making / Profiling
              </p>
              <p id={`${instanceId}-automated-desc`} className={resolveClass('text-xs text-gray-500 dark:text-gray-400 mt-0.5', classNames?.disclosureDescription, unstyled)}>
                Do you use algorithms or AI to make decisions about individuals? Requires disclosure under NDPA Section 37.
              </p>
            </div>
            <Toggle
              id={`${instanceId}-automated-toggle`}
              checked={context.hasAutomatedDecisions}
              onChange={(val) => onUpdateContext({ hasAutomatedDecisions: val })}
            />
          </div>
        </div>
      </section>
    </div>
  );
};

export default PolicyStepProcessing;
