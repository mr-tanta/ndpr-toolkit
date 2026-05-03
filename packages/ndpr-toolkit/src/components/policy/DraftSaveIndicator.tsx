import React from 'react';
import { resolveClass } from '../../utils/styling';

export type DraftSaveStatus = 'saved' | 'saving' | 'error' | 'idle';

export interface DraftSaveIndicatorProps {
  /** Timestamp (ms) of last successful save, or null if never saved. */
  lastSavedAt: number | null;
  /** Whether a save is currently in progress. */
  isSaving?: boolean;
  /** Whether the last save attempt failed. */
  hasError?: boolean;
  classNames?: Record<string, string>;
  unstyled?: boolean;
}

function formatRelativeTime(ts: number): string {
  const diff = Date.now() - ts;
  if (diff < 10_000) return 'just now';
  if (diff < 60_000) return `${Math.floor(diff / 1000)}s ago`;
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`;
  return new Date(ts).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
}

export const DraftSaveIndicator: React.FC<DraftSaveIndicatorProps> = ({
  lastSavedAt,
  isSaving,
  hasError,
  classNames,
  unstyled,
}) => {
  let status: DraftSaveStatus = 'idle';
  if (isSaving) status = 'saving';
  else if (hasError) status = 'error';
  else if (lastSavedAt !== null) status = 'saved';

  if (status === 'idle') return null;

  const text =
    status === 'saving'
      ? 'Saving…'
      : status === 'error'
        ? 'Unable to save'
        : `Draft saved ${lastSavedAt ? formatRelativeTime(lastSavedAt) : ''}`;

  const colorClass =
    status === 'error'
      ? 'text-red-500 dark:text-red-400'
      : status === 'saving'
        ? 'ndpr-card__subtitle'
        : 'ndpr-text-success';

  return (
    <div
      data-ndpr-component="draft-save-indicator"
      role="status"
      aria-live="polite"
      aria-atomic="true"
      className={resolveClass(
        `flex items-center gap-1.5 ${colorClass}`,
        classNames?.root,
        unstyled,
      )}
    >
      {status === 'saving' && (
        <svg
          className="animate-spin w-3 h-3 flex-shrink-0"
          fill="none"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a10 10 0 100 10l-1.73-3A8 8 0 014 12z" />
        </svg>
      )}
      {status === 'saved' && (
        <svg className="w-3 h-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3} aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      )}
      {status === 'error' && (
        <svg className="w-3 h-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
        </svg>
      )}
      <span
        className={resolveClass(
          'text-xs font-medium',
          classNames?.text,
          unstyled,
        )}
      >
        {text}
      </span>
    </div>
  );
};

export default DraftSaveIndicator;
