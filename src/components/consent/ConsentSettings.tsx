import React, { ReactNode } from 'react';
import { useConsent } from '@/contexts/ConsentContext';
import { Button } from '@/components/ui/Button';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { SettingsProps } from './ConsentManager';

export interface ConsentSettingsProps {
  renderSettings?: (props: SettingsProps) => ReactNode;
  theme?: {
    primaryColor?: string;
    textColor?: string;
    backgroundColor?: string;
  };
  unstyled?: boolean;
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

export const ConsentSettings: React.FC<ConsentSettingsProps> = ({
  renderSettings,
  theme,
  unstyled = false,
  className,
  children,
}) => {
  const { showSettings, consentState, updateConsent, savePreferences, closeSettings } = useConsent();

  if (!showSettings) return null;

  const handleSave = () => {
    savePreferences(consentState);
  };

  // Custom render function
  if (renderSettings) {
    return (
      <>
        {renderSettings({
          consentState,
          onUpdateConsent: updateConsent,
          onSave: handleSave,
          onClose: closeSettings,
        })}
      </>
    );
  }

  // Children-based composition
  if (children) {
    return (
      <Dialog open={showSettings} onOpenChange={closeSettings}>
        <DialogContent className={className} unstyled={unstyled}>
          {children}
        </DialogContent>
      </Dialog>
    );
  }

  // Default implementation
  return (
    <Dialog open={showSettings} onOpenChange={closeSettings}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Cookie Preferences</DialogTitle>
          <DialogDescription>
            Manage your cookie preferences. You can enable or disable different categories of cookies below.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {cookieCategories.map((category) => (
            <div key={category.id} className="flex items-start justify-between space-x-4">
              <div className="flex-1">
                <h4 className="font-medium mb-1">{category.name}</h4>
                <p className="text-sm text-gray-600">{category.description}</p>
              </div>
              <Switch
                checked={consentState[category.id as keyof typeof consentState]}
                onCheckedChange={(checked) => updateConsent(category.id as keyof typeof consentState, checked)}
                disabled={category.disabled}
              />
            </div>
          ))}
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button variant="outline" onClick={closeSettings}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            style={{ backgroundColor: theme?.primaryColor }}
          >
            Save Preferences
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};