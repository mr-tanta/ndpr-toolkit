import React, { useState } from 'react';
import { useConsentCompound } from './context';
import { resolveClass } from '../../utils/styling';

export interface OptionListProps {
  classNames?: {
    root?: string;
    optionItem?: string;
    optionCheckbox?: string;
    optionLabel?: string;
    optionDescription?: string;
  };
  unstyled?: boolean;
}

export const OptionList: React.FC<OptionListProps> = ({ classNames, unstyled }) => {
  const { options, settings } = useConsentCompound();
  const [localConsents, setLocalConsents] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    options.forEach(opt => {
      initial[opt.id] = settings?.consents[opt.id] ?? opt.defaultValue ?? false;
    });
    return initial;
  });

  return (
    <div className={resolveClass('space-y-3', classNames?.root, unstyled)} data-ndpr-component="consent-option-list">
      {options.map(option => (
        <div key={option.id} className={resolveClass('flex items-start', classNames?.optionItem, unstyled)}>
          <div className="flex items-center h-5">
            <input
              id={`consent-${option.id}`}
              type="checkbox"
              checked={localConsents[option.id] || false}
              onChange={e => setLocalConsents(prev => ({ ...prev, [option.id]: e.target.checked }))}
              disabled={option.required}
              className={resolveClass(
                'h-4 w-4 rounded border-gray-300 text-[rgb(var(--ndpr-primary))] focus:ring-[rgb(var(--ndpr-ring))]',
                classNames?.optionCheckbox, unstyled
              )}
              aria-label={option.label}
            />
          </div>
          <div className="ml-3 text-sm">
            <label htmlFor={`consent-${option.id}`} className={resolveClass('font-medium', classNames?.optionLabel, unstyled)}>
              {option.label} {option.required && <span className="text-red-500">*</span>}
            </label>
            <p className={resolveClass('text-gray-600 dark:text-gray-400', classNames?.optionDescription, unstyled)}>
              {option.description}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};
