import React, { useState } from 'react';
import type { PolicySection } from '../../types/privacy';
import type { ComplianceResult, CustomSection } from '../../types/policy-engine';
import { resolveClass } from '../../utils/styling';
import { PolicySectionCard } from './PolicySectionCard';
import { CustomSectionForm } from './CustomSectionForm';
import { PolicyExportPanel } from './PolicyExportPanel';

export interface PolicyStepReviewProps {
  sections: PolicySection[];
  customSections: CustomSection[];
  sectionOverrides: Record<string, string>;
  complianceResult: ComplianceResult;
  onEditSection: (sectionId: string, content: string) => void;
  onAddCustomSection: (section: { title: string; content: string; order: number }) => void;
  onRemoveCustomSection: (id: string) => void;
  onReorderSection: (sectionId: string, direction: 'up' | 'down') => void;
  onExportPDF: () => Promise<void>;
  onExportDOCX: () => Promise<void>;
  onExportHTML: () => void;
  onExportMarkdown: () => void;
  classNames?: Record<string, string>;
  unstyled?: boolean;
}

export const PolicyStepReview: React.FC<PolicyStepReviewProps> = ({
  sections,
  customSections,
  sectionOverrides,
  complianceResult,
  onEditSection,
  onAddCustomSection,
  onRemoveCustomSection,
  onReorderSection,
  onExportPDF,
  onExportDOCX,
  onExportHTML,
  onExportMarkdown,
  classNames,
  unstyled,
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showCustomForm, setShowCustomForm] = useState(false);

  const customSectionIds = new Set(customSections.map((cs) => cs.id));

  const handleSaveEdit = (sectionId: string, content: string) => {
    onEditSection(sectionId, content);
    setEditingId(null);
  };

  const nextOrder = sections.length > 0
    ? Math.max(...sections.map((s) => s.order ?? 0)) + 1
    : 1;

  return (
    <div
      data-ndpr-component="policy-step-review"
      className={resolveClass('space-y-6', classNames?.root, unstyled)}
    >
      <div>
        <h2 className={resolveClass('text-xl font-semibold text-gray-900 dark:text-gray-100', classNames?.heading, unstyled)}>
          Review &amp; Export
        </h2>
        <p className={resolveClass('text-sm text-gray-500 dark:text-gray-400 mt-1', classNames?.subheading, unstyled)}>
          Review your generated policy sections, reorder or edit content, then export.
        </p>
      </div>

      {/* Section list */}
      <div className={resolveClass('space-y-3', classNames?.sectionList, unstyled)}>
        {sections.map((section, index) => (
          <PolicySectionCard
            key={section.id}
            section={
              sectionOverrides[section.id]
                ? { ...section, template: sectionOverrides[section.id] }
                : section
            }
            index={index}
            isCustom={customSectionIds.has(section.id)}
            isEditing={editingId === section.id}
            editedContent={sectionOverrides[section.id]}
            onEdit={() => setEditingId(section.id)}
            onSaveEdit={(content) => handleSaveEdit(section.id, content)}
            onCancelEdit={() => setEditingId(null)}
            onMoveUp={index > 0 ? () => onReorderSection(section.id, 'up') : undefined}
            onMoveDown={index < sections.length - 1 ? () => onReorderSection(section.id, 'down') : undefined}
            onDelete={customSectionIds.has(section.id) ? () => onRemoveCustomSection(section.id) : undefined}
            classNames={classNames}
            unstyled={unstyled}
          />
        ))}
      </div>

      {/* Add custom section toggle */}
      {!showCustomForm && (
        <button
          type="button"
          onClick={() => setShowCustomForm(true)}
          className={resolveClass(
            'flex items-center gap-2 text-sm text-[rgb(var(--ndpr-primary))] hover:underline font-medium',
            classNames?.addSectionButton,
            unstyled,
          )}
        >
          <span
            className={resolveClass(
              'w-5 h-5 rounded-full border-2 border-[rgb(var(--ndpr-primary))] flex items-center justify-center text-xs font-bold leading-none',
              classNames?.addSectionIcon,
              unstyled,
            )}
            aria-hidden="true"
          >
            +
          </span>
          Add Custom Section
        </button>
      )}

      {showCustomForm && (
        <div className={resolveClass('space-y-2', classNames?.customFormWrapper, unstyled)}>
          <CustomSectionForm
            onAdd={(section) => {
              onAddCustomSection(section);
              setShowCustomForm(false);
            }}
            nextOrder={nextOrder}
            classNames={classNames}
            unstyled={unstyled}
          />
          <button
            type="button"
            onClick={() => setShowCustomForm(false)}
            className={resolveClass(
              'text-sm text-gray-500 dark:text-gray-400 hover:underline',
              classNames?.cancelCustomForm,
              unstyled,
            )}
          >
            Cancel
          </button>
        </div>
      )}

      {/* Divider */}
      <hr className={resolveClass('border-gray-200 dark:border-gray-700', classNames?.divider, unstyled)} />

      {/* Export panel */}
      <PolicyExportPanel
        complianceResult={complianceResult}
        onExportPDF={onExportPDF}
        onExportDOCX={onExportDOCX}
        onExportHTML={onExportHTML}
        onExportMarkdown={onExportMarkdown}
        classNames={classNames}
        unstyled={unstyled}
      />
    </div>
  );
};

export default PolicyStepReview;
