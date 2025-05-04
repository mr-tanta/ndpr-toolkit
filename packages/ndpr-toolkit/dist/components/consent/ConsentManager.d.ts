import React from 'react';
import { ConsentOption, ConsentSettings } from '../../types/consent';
export interface ConsentManagerProps {
    /**
     * Array of consent options to display
     */
    options: ConsentOption[];
    /**
     * Current consent settings
     */
    settings?: ConsentSettings;
    /**
     * Callback function called when user saves their consent choices
     */
    onSave: (settings: ConsentSettings) => void;
    /**
     * Title displayed in the manager
     * @default "Manage Your Privacy Settings"
     */
    title?: string;
    /**
     * Description text displayed in the manager
     * @default "Update your consent preferences at any time. Required cookies cannot be disabled as they are necessary for the website to function."
     */
    description?: string;
    /**
     * Text for the save button
     * @default "Save Preferences"
     */
    saveButtonText?: string;
    /**
     * Text for the reset button
     * @default "Reset to Defaults"
     */
    resetButtonText?: string;
    /**
     * Version of the consent form
     * @default "1.0"
     */
    version?: string;
    /**
     * Custom CSS class for the manager
     */
    className?: string;
    /**
     * Custom CSS class for the buttons
     */
    buttonClassName?: string;
    /**
     * Custom CSS class for the primary button
     */
    primaryButtonClassName?: string;
    /**
     * Custom CSS class for the secondary button
     */
    secondaryButtonClassName?: string;
    /**
     * Whether to show a success message after saving
     * @default true
     */
    showSuccessMessage?: boolean;
    /**
     * Success message to display after saving
     * @default "Your preferences have been saved."
     */
    successMessage?: string;
    /**
     * Duration to show the success message (in milliseconds)
     * @default 3000
     */
    successMessageDuration?: number;
}
export declare const ConsentManager: React.FC<ConsentManagerProps>;
