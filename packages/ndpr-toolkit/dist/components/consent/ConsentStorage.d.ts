import React from 'react';
import { ConsentSettings, ConsentStorageOptions } from '../../types/consent';
export interface ConsentStorageClassNames {
    root?: string;
}
export interface ConsentStorageProps {
    /**
     * Current consent settings
     */
    settings: ConsentSettings;
    /**
     * Storage options for consent settings
     */
    storageOptions?: ConsentStorageOptions;
    /**
     * Callback function called when settings are loaded from storage
     */
    onLoad?: (settings: ConsentSettings | null) => void;
    /**
     * Callback function called when settings are saved to storage
     */
    onSave?: (settings: ConsentSettings) => void;
    /**
     * Whether to automatically save settings to storage
     * @default true
     */
    autoSave?: boolean;
    /**
     * Whether to automatically load settings from storage on mount
     * @default true
     */
    autoLoad?: boolean;
    /**
     * Object of CSS class overrides keyed by semantic section name.
     */
    classNames?: ConsentStorageClassNames;
    /**
     * When true, all default classes are removed so consumers
     * can style from scratch using classNames.
     */
    unstyled?: boolean;
    /**
     * Children to render
     * Can be either React nodes or a render prop function that receives storage methods
     */
    children?: React.ReactNode | ((props: {
        loadSettings: () => ConsentSettings | null;
        saveSettings: (settings: ConsentSettings) => void;
        clearSettings: () => void;
        loaded: boolean;
    }) => React.ReactNode);
}
export declare const ConsentStorage: ({ settings, storageOptions, onLoad, onSave, autoSave, autoLoad, classNames, unstyled, children }: ConsentStorageProps) => React.ReactElement | null;
