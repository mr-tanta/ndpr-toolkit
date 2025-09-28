import React, { ReactNode } from 'react';
import { useConsent } from '@/contexts/ConsentContext';

export interface UnstyledConsentSettingsProps {
  className?: string;
  children?: ReactNode;
}

const cookieCategories = [
  {
    id: 'necessary',
    name: 'Necessary Cookies',
    description: 'These cookies are essential for the website to function properly.',
    disabled: true,
  },
  {
    id: 'analytics',
    name: 'Analytics Cookies',
    description: 'These cookies help us understand how visitors interact with our website.',
    disabled: false,
  },
  {
    id: 'marketing',
    name: 'Marketing Cookies',
    description: 'These cookies are used to track visitors across websites for marketing purposes.',
    disabled: false,
  },
  {
    id: 'functional',
    name: 'Functional Cookies',
    description: 'These cookies enable personalized features and functionality.',
    disabled: false,
  },
];

export const UnstyledConsentSettings: React.FC<UnstyledConsentSettingsProps> = ({
  className,
  children,
}) => {
  const { showSettings, consentState, updateConsent, savePreferences, closeSettings } = useConsent();

  if (!showSettings) return null;

  const handleSave = () => {
    savePreferences(consentState);
  };

  return (
    <div className={className} role="dialog" aria-label="Cookie preferences">
      {children || (
        <>
          <div>
            <h2>Cookie Preferences</h2>
            <p>Manage your cookie preferences. You can enable or disable different categories of cookies below.</p>
          </div>
          
          <div>
            {cookieCategories.map((category) => (
              <div key={category.id}>
                <div>
                  <h4>{category.name}</h4>
                  <p>{category.description}</p>
                </div>
                <input
                  type="checkbox"
                  checked={consentState[category.id as keyof typeof consentState]}
                  onChange={(e) => updateConsent(category.id as keyof typeof consentState, e.target.checked)}
                  disabled={category.disabled}
                  aria-label={`Toggle ${category.name}`}
                />
              </div>
            ))}
          </div>

          <div>
            <button onClick={closeSettings} aria-label="Cancel changes">
              Cancel
            </button>
            <button onClick={handleSave} aria-label="Save cookie preferences">
              Save Preferences
            </button>
          </div>
        </>
      )}
    </div>
  );
};