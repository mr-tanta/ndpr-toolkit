import { DPIAQuestion, DPIASection, DPIAResult } from '../types/dpia';
interface UseDPIAOptions {
    /**
     * Sections of the DPIA questionnaire
     */
    sections: DPIASection[];
    /**
     * Initial answers (if resuming a DPIA)
     */
    initialAnswers?: Record<string, any>;
    /**
     * Storage key for DPIA data
     * @default "ndpr_dpia_data"
     */
    storageKey?: string;
    /**
     * Whether to use local storage to persist DPIA data
     * @default true
     */
    useLocalStorage?: boolean;
    /**
     * Callback function called when the DPIA is completed
     */
    onComplete?: (result: DPIAResult) => void;
}
interface UseDPIAReturn {
    /**
     * Current section index
     */
    currentSectionIndex: number;
    /**
     * Current section
     */
    currentSection: DPIASection | null;
    /**
     * All answers
     */
    answers: Record<string, any>;
    /**
     * Update an answer
     */
    updateAnswer: (questionId: string, value: any) => void;
    /**
     * Go to the next section
     */
    nextSection: () => boolean;
    /**
     * Go to the previous section
     */
    prevSection: () => boolean;
    /**
     * Go to a specific section
     */
    goToSection: (index: number) => boolean;
    /**
     * Check if the current section is valid
     */
    isCurrentSectionValid: () => boolean;
    /**
     * Get validation errors for the current section
     */
    getCurrentSectionErrors: () => Record<string, string>;
    /**
     * Check if the DPIA is complete
     */
    isComplete: () => boolean;
    /**
     * Complete the DPIA and generate a result
     */
    completeDPIA: (assessorInfo: {
        name: string;
        role: string;
        email: string;
    }, title: string, processingDescription: string) => DPIAResult;
    /**
     * Get the visible questions for the current section
     */
    getVisibleQuestions: () => DPIAQuestion[];
    /**
     * Reset the DPIA
     */
    resetDPIA: () => void;
    /**
     * Progress percentage
     */
    progress: number;
}
/**
 * Hook for conducting Data Protection Impact Assessments in compliance with the NDPA 2023
 */
export declare function useDPIA({ sections, initialAnswers, storageKey, useLocalStorage, onComplete }: UseDPIAOptions): UseDPIAReturn;
export {};
