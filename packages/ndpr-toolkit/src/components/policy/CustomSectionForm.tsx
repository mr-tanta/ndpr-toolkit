import React, { useState, useId } from 'react';
import { resolveClass } from '../../utils/styling';

export interface CustomSectionFormProps {
  onAdd: (section: { title: string; content: string; order: number }) => void;
  nextOrder: number;
  classNames?: Record<string, string>;
  unstyled?: boolean;
}

const INPUT_CLASS =
  'w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 ndpr-text-foreground focus:outline-none focus:ring-2 focus:ring-[rgb(var(--ndpr-ring))] text-sm';

export const CustomSectionForm: React.FC<CustomSectionFormProps> = ({
  onAdd,
  nextOrder,
  classNames,
  unstyled,
}) => {
  const instanceId = useId();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [error, setError] = useState('');

  const handleAdd = () => {
    if (!title.trim()) {
      setError('Section title is required.');
      return;
    }
    if (!content.trim()) {
      setError('Section content is required.');
      return;
    }
    setError('');
    onAdd({ title: title.trim(), content: content.trim(), order: nextOrder });
    setTitle('');
    setContent('');
  };

  return (
    <div
      data-ndpr-component="custom-section-form"
      className={resolveClass(
        'ndpr-card ndpr-card--compact',
        classNames?.root,
        unstyled,
      )}
    >
      <h4
        className={resolveClass(
          'ndpr-section-heading',
          classNames?.heading,
          unstyled,
        )}
      >
        Add Custom Section
      </h4>

      {error && (
        <p
          role="alert"
          className={resolveClass(
            'text-xs ndpr-text-destructive',
            classNames?.error,
            unstyled,
          )}
        >
          {error}
        </p>
      )}

      <div className={resolveClass('space-y-3', classNames?.fields, unstyled)}>
        <div>
          <label
            htmlFor={`${instanceId}-custom-section-title`}
            className={resolveClass(
              'block text-xs font-medium ndpr-text-muted mb-1',
              classNames?.label,
              unstyled,
            )}
          >
            Section Title <span className="text-red-500" aria-hidden="true">*</span>
          </label>
          <input
            id={`${instanceId}-custom-section-title`}
            type="text"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              if (error) setError('');
            }}
            placeholder="e.g. Cookie Policy"
            className={resolveClass(INPUT_CLASS, classNames?.input, unstyled)}
            aria-required="true"
          />
        </div>

        <div>
          <label
            htmlFor={`${instanceId}-custom-section-content`}
            className={resolveClass(
              'block text-xs font-medium ndpr-text-muted mb-1',
              classNames?.label,
              unstyled,
            )}
          >
            Content <span className="text-red-500" aria-hidden="true">*</span>
          </label>
          <textarea
            id={`${instanceId}-custom-section-content`}
            value={content}
            onChange={(e) => {
              setContent(e.target.value);
              if (error) setError('');
            }}
            placeholder="Write the section content here..."
            rows={5}
            className={resolveClass(
              `${INPUT_CLASS} resize-y`,
              classNames?.textarea,
              unstyled,
            )}
            aria-required="true"
          />
        </div>
      </div>

      <div className={resolveClass('flex items-center gap-2', classNames?.footer, unstyled)}>
        <button
          type="button"
          onClick={handleAdd}
          className={resolveClass(
            'ndpr-button ndpr-button--primary ndpr-button--sm',
            classNames?.addButton,
            unstyled,
          )}
        >
          Add Section
        </button>
      </div>
    </div>
  );
};

export default CustomSectionForm;
