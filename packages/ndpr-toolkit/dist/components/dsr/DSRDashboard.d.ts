import React from 'react';
import { DSRRequest, DSRStatus } from '../../types/dsr';
export interface DSRDashboardClassNames {
    root?: string;
    header?: string;
    title?: string;
    filters?: string;
    requestList?: string;
    requestItem?: string;
    statusBadge?: string;
    detailPanel?: string;
}
export interface DSRDashboardProps {
    /**
     * List of DSR requests to display
     */
    requests: DSRRequest[];
    /**
     * Callback function called when a request is selected
     */
    onSelectRequest?: (requestId: string) => void;
    /**
     * Callback function called when a request status is updated
     */
    onUpdateStatus?: (requestId: string, status: DSRStatus) => void;
    /**
     * Callback function called when a request is assigned
     */
    onAssignRequest?: (requestId: string, assignee: string) => void;
    /**
     * Title displayed on the dashboard
     * @default "Data Subject Request Dashboard"
     */
    title?: string;
    /**
     * Description text displayed on the dashboard
     * @default "Track and manage data subject requests in compliance with NDPA requirements."
     */
    description?: string;
    /**
     * Custom CSS class for the dashboard
     */
    className?: string;
    /**
     * Custom CSS class for the buttons
     */
    buttonClassName?: string;
    /**
     * Whether to show the request details
     * @default true
     */
    showRequestDetails?: boolean;
    /**
     * Whether to show the request timeline
     * @default true
     */
    showRequestTimeline?: boolean;
    /**
     * Whether to show the deadline alerts
     * @default true
     */
    showDeadlineAlerts?: boolean;
    /**
     * List of possible assignees
     */
    assignees?: string[];
    /**
     * Object of CSS class overrides keyed by semantic section name.
     */
    classNames?: DSRDashboardClassNames;
    /**
     * When true, all default Tailwind classes are removed so consumers
     * can style from scratch using classNames.
     */
    unstyled?: boolean;
}
export declare const DSRDashboard: React.FC<DSRDashboardProps>;
