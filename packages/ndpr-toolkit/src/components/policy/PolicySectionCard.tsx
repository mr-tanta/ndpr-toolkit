import React, { useState, useEffect } from 'react';
import type { PolicySection } from '../../types/privacy';
import { resolveClass } from '../../utils/styling';

export interface PolicySectionCardProps {
  section: PolicySection;
  index: number;
  isCustom?: boolean;
  isEditing?: boolean;
  editedContent?: string;
  onEdit: () => void;
  onSaveEdit: (content: string) => void;
  onCancelEdit: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  onDelete?: () => void;
  classNames?: Record<string, string>;
  unstyled?: boolean;
}

export const PolicySectionCard: React.FC<PolicySectionCardProps> = ({
  section,
  index,
  isCustom,
  isEditing,
  editedContent,
  onEdit,
  onSaveEdit,
  onCancelEdit,
  onMoveUp,
  onMoveDown,
  onDelete,
  classNames,
  unstyled,
}) => {
  const [localContent, setLocalContent] = useState(editedContent ?? section.template);

  // Sync if parent resets editedContent
  useEffect(() => {
    if (editedContent !== undefined) setLocalContent(editedContent);
  }, [editedContent]);

  // When entering edit mode, seed with current template
  useEffect(() => {
    if (isEditing) {
      setLocalContent(editedContent ?? section.template);
    }
  }, [isEditing, editedContent, section.template]);

  return (
    <div
      data-ndpr-component="policy-section-card"
      className={resolveClass(
        'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-3',
        classNames?.root,
        unstyled,
      )}
    >
      {/* Header row */}
      <div className={resolveClass('flex items-start justify-between gap-2', classNames?.header, unstyled)}>
        <div className={resolveClass('flex items-center gap-3 min-w-0', classNames?.titleRow, unstyled)}>
          <span
            className={resolveClass(
              'flex-shrink-0 w-7 h-7 rounded-full bg-gray-100 dark:bg-gray-700 ndpr-text-muted text-xs font-semibold flex items-center justify-center',
              classNames?.sectionNumber,
              unstyled,
            )}
            aria-hidden="true"
          >
            {index + 1}
          </span>
          <h4
            className={resolveClass(
              'text-sm font-semibold ndpr-text-foreground truncate',
              classNames?.sectionTitle,
              unstyled,
            )}
          >
            {section.title}
            {isCustom && (
              <span
                className={resolveClass(
                  'ml-2 text-xs font-normal ndpr-text-muted bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded',
                  classNames?.customBadge,
                  unstyled,
                )}
              >
                Custom
              </span>
            )}
          </h4>
        </div>

        {/* Action buttons */}
        <div className={resolveClass('flex items-center gap-1 flex-shrink-0', classNames?.actions, unstyled)}>
          {onMoveUp && (
            <button
              type="button"
              onClick={onMoveUp}
              className={resolveClass(
                'ndpr-button ndpr-button--icon',
                classNames?.moveButton,
                unstyled,
              )}
              aria-label={`Move "${section.title}" up`}
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
              </svg>
            </button>
          )}
          {onMoveDown && (
            <button
              type="button"
              onClick={onMoveDown}
              className={resolveClass(
                'ndpr-button ndpr-button--icon',
                classNames?.moveButton,
                unstyled,
              )}
              aria-label={`Move "${section.title}" down`}
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          )}

          {!isEditing && (
            <button
              type="button"
              onClick={onEdit}
              className={resolveClass(
                'p-1.5 text-gray-400 hover:text-[rgb(var(--ndpr-primary))] rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors',
                classNames?.editButton,
                unstyled,
              )}
              aria-label={`Edit "${section.title}"`}
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
          )}

          {isCustom && onDelete && (
            <button
              type="button"
              onClick={onDelete}
              className={resolveClass(
                'p-1.5 text-gray-400 hover:text-red-500 dark:hover:text-red-400 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors',
                classNames?.deleteButton,
                unstyled,
              )}
              aria-label={`Delete "${section.title}"`}
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Content area */}
      {isEditing ? (
        <div className={resolveClass('space-y-2', classNames?.editArea, unstyled)}>
          <textarea
            value={localContent}
            onChange={(e) => setLocalContent(e.target.value)}
            rows={8}
            className={resolveClass(
              'w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 ndpr-text-foreground focus:outline-none focus:ring-2 focus:ring-[rgb(var(--ndpr-ring))] text-sm font-mono resize-y',
              classNames?.textarea,
              unstyled,
            )}
            aria-label={`Edit content for ${section.title}`}
          />
          <div className={resolveClass('flex gap-2', classNames?.editActions, unstyled)}>
            <button
              type="button"
              onClick={() => onSaveEdit(localContent)}
              className={resolveClass(
                'ndpr-button ndpr-button--primary ndpr-button--sm',
                classNames?.saveButton,
                unstyled,
              )}
            >
              Save
            </button>
            <button
              type="button"
              onClick={onCancelEdit}
              className={resolveClass(
                'ndpr-button ndpr-button--secondary ndpr-button--sm',
                classNames?.cancelButton,
                unstyled,
              )}
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div
          className={resolveClass(
            'text-sm ndpr-text-muted leading-relaxed line-clamp-4 whitespace-pre-wrap',
            classNames?.content,
            unstyled,
          )}
        >
          {section.template}
        </div>
      )}
    </div>
  );
};

export default PolicySectionCard;
