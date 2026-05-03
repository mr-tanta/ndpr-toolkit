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
    <div
      className={resolveClass('ndpr-consent-banner__options-list', classNames?.root, unstyled)}
      data-ndpr-component="consent-option-list"
    >
      {options.map(option => (
        <div key={option.id} className={resolveClass('ndpr-consent-banner__option', classNames?.optionItem, unstyled)}>
          <input
            id={`consent-${option.id}`}
            type="checkbox"
            checked={localConsents[option.id] || false}
            onChange={e => setLocalConsents(prev => ({ ...prev, [option.id]: e.target.checked }))}
            disabled={option.required}
            className={resolveClass('ndpr-consent-banner__option-checkbox', classNames?.optionCheckbox, unstyled)}
            aria-label={option.label}
          />
          <div className={unstyled ? '' : 'ndpr-consent-banner__option-text'}>
            <label htmlFor={`consent-${option.id}`} className={resolveClass('ndpr-consent-banner__option-label', classNames?.optionLabel, unstyled)}>
              {option.label}
              {option.required && <span className={unstyled ? '' : 'ndpr-consent-banner__required-marker'}> *</span>}
            </label>
            <p className={resolveClass('ndpr-consent-banner__option-description', classNames?.optionDescription, unstyled)}>
              {option.description}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};
