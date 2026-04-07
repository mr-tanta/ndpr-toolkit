import React from 'react';
import { DSRRequest } from '../../types/dsr';
export interface DSRTrackerClassNames {
    root?: string;
    header?: string;
    title?: string;
    stats?: string;
    statCard?: string;
    table?: string;
    tableHeader?: string;
    tableRow?: string;
    statusBadge?: string;
}
export interface DSRTrackerProps {
    /**
     * List of DSR requests to track
     */
    requests: DSRRequest[];
    /**
     * Callback function called when a request is selected
     */
    onSelectRequest?: (requestId: string) => void;
    /**
     * Title displayed on the tracker
     * @default "DSR Request Tracker"
     */
    title?: string;
    /**
     * Description text displayed on the tracker
     * @default "Track the status and progress of data subject requests as required by NDPA Part IV."
     */
    description?: string;
    /**
     * Custom CSS class for the tracker
     */
    className?: string;
    /**
     * Custom CSS class for the buttons
     */
    buttonClassName?: string;
    /**
     * Whether to show the summary statistics
     * @default true
     */
    showSummaryStats?: boolean;
    /**
     * Whether to show the request type breakdown
     * @default true
     */
    showTypeBreakdown?: boolean;
    /**
     * Whether to show the status breakdown
     * @default true
     */
    showStatusBreakdown?: boolean;
    /**
     * Whether to show the timeline chart
     * @default true
     */
    showTimelineChart?: boolean;
    /**
     * Whether to show the overdue requests
     * @default true
     */
    showOverdueRequests?: boolean;
    /**
     * Object of CSS class overrides keyed by semantic section name.
     */
    classNames?: DSRTrackerClassNames;
    /**
     * When true, all default Tailwind classes are removed so consumers
     * can style from scratch using classNames.
     */
    unstyled?: boolean;
}
/**
 * DSR tracking and analytics component. Supports compliance with NDPA Part IV,
 * providing summary statistics, deadline tracking, and compliance metrics for data subject requests.
 */
export declare const DSRTracker: React.FC<DSRTrackerProps>;
