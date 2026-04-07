import React from 'react';
import { ConsentOption, ConsentSettings } from '../../types/consent';
export interface ConsentBannerClassNames {
    root?: string;
    container?: string;
    title?: string;
    description?: string;
    optionsList?: string;
    optionItem?: string;
    optionCheckbox?: string;
    optionLabel?: string;
    optionDescription?: string;
    buttonGroup?: string;
    acceptButton?: string;
    rejectButton?: string;
    customizeButton?: string;
    saveButton?: string;
}
export interface ConsentBannerProps {
    /**
     * Array of consent options to display
     */
    options: ConsentOption[];
    /**
     * Callback function called when user saves their consent choices
     */
    onSave: (settings: ConsentSettings) => void;
    /**
     * Title displayed on the banner
     * @default "We Value Your Privacy"
     */
    title?: string;
    /**
     * Description text displayed on the banner
     * @default "We use cookies and similar technologies to provide our services and enhance your experience."
     */
    description?: string;
    /**
     * Text for the accept all button
     * @default "Accept All"
     */
    acceptAllButtonText?: string;
    /**
     * Text for the reject all button
     * @default "Reject All"
     */
    rejectAllButtonText?: string;
    /**
     * Text for the customize button
     * @default "Customize"
     */
    customizeButtonText?: string;
    /**
     * Text for the save button
     * @default "Save Preferences"
     */
    saveButtonText?: string;
    /**
     * Position of the banner.
     * 'top', 'bottom', and 'center' render via a portal to document.body
     * with fixed positioning so the banner overlays the page.
     * 'inline' renders in the normal DOM tree without a portal.
     * @default "bottom"
     */
    position?: 'top' | 'bottom' | 'center' | 'inline';
    /**
     * z-index applied to the fixed-position banner.
     * Ignored when position is 'inline'.
     * @default 9999
     */
    zIndex?: number;
    /**
     * Version of the consent form
     * @default "1.0"
     */
    version?: string;
    /**
     * Whether to show the banner
     * If not provided, the banner will be shown if no consent has been saved
     */
    show?: boolean;
    /**
     * Storage key for consent settings
     * @default "ndpr_consent"
     */
    storageKey?: string;
    /**
     * Custom CSS class for the banner
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
     * Object of CSS class overrides keyed by semantic section name.
     * Takes priority over buttonClassName / primaryButtonClassName / secondaryButtonClassName.
     */
    classNames?: ConsentBannerClassNames;
    /**
     * When true, all default Tailwind classes are removed so consumers
     * can style from scratch using classNames.
     */
    unstyled?: boolean;
}
export declare const ConsentBanner: React.FC<ConsentBannerProps>;
