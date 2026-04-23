import React, { useMemo } from 'react';
import { DPIAResult, DPIASection, DPIARisk } from '../../types/dpia';
import { resolveClass } from '../../utils/styling';

export interface DPIAReportClassNames {
  /** Outermost wrapper */
  root?: string;
  /** Report header area */
  header?: string;
  /** Main report title */
  title?: string;
  /** Executive summary section */
  summary?: string;
  /** Risk level badge */
  riskBadge?: string;
  /** Risks table element */
  riskTable?: string;
  /** Individual risk row */
  riskRow?: string;
  /** Recommendation list item */
  recommendation?: string;
  /** Conclusion text */
  conclusion?: string;
  /** Print button */
  printButton?: string;
  /** Alias for printButton */
  primaryButton?: string;
}

export interface DPIAReportProps {
  /**
   * The DPIA result to display
   */
  result: DPIAResult;

  /**
   * The sections of the DPIA questionnaire
   */
  sections: DPIASection[];

  /**
   * Whether to show the full report or just a summary
   * @default true
   */
  showFullReport?: boolean;

  /**
   * Whether to allow printing the report
   * @default true
   */
  allowPrint?: boolean;

  /**
   * Whether to allow exporting the report as PDF
   * @default true
   */
  allowExport?: boolean;

  /**
   * Callback function called when the report is exported
   */
  onExport?: (format: 'pdf' | 'docx' | 'html') => void;

  /**
   * Custom CSS class for the report container
   */
  className?: string;

  /**
   * Custom CSS class for the buttons
   */
  buttonClassName?: string;

  /**
   * Per-section class name overrides
   */
  classNames?: DPIAReportClassNames;

  /**
   * When true, all default classes are stripped.
   * Only explicit overrides from `classNames` are applied.
   * @default false
   */
  unstyled?: boolean;
}

/**
 * DPIA report component. Implements NDPA Sections 38-39 requirements for documenting
 * and presenting Data Protection Impact Assessment findings, risks, and recommendations.
 */
export const DPIAReport: React.FC<DPIAReportProps> = ({
  result,
  sections,
  showFullReport = true,
  allowPrint = true,
  allowExport = true,
  onExport,
  className = '',
  buttonClassName = '',
  classNames = {},
  unstyled = false,
}) => {
  const generatedDate = useMemo(() => new Date().toLocaleDateString(), []);

  const cx = (defaultClass: string, key?: keyof DPIAReportClassNames) => {
    let override = key ? classNames[key] : undefined;
    if (!override && key === 'printButton') override = classNames.primaryButton;
    return resolveClass(defaultClass, override, unstyled);
  };

  // Format a date from timestamp
  const formatDate = (timestamp: number): string => {
    return new Date(timestamp).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  // Get the section title by ID
  const getSectionTitle = (sectionId: string): string => {
    const section = sections.find(s => s.id === sectionId);
    return section?.title || 'Unknown Section';
  };

  // Get the question text by ID
  const getQuestionText = (questionId: string): string => {
    let questionText = 'Unknown Question';

    sections.forEach(section => {
      const question = section.questions.find(q => q.id === questionId);
      if (question) {
        questionText = question.text;
      }
    });

    return questionText;
  };

  // Get the answer text for a question
  const getAnswerText = (questionId: string): string => {
    const answer = result.answers[questionId];

    if (answer === undefined || answer === null) {
      return 'Not answered';
    }

    if (typeof answer === 'boolean') {
      return answer ? 'Yes' : 'No';
    }

    if (Array.isArray(answer)) {
      return answer.join(', ');
    }

    return String(answer);
  };

  // Handle print button click
  const handlePrint = () => {
    window.print();
  };

  // Handle export button click
  const handleExport = (format: 'pdf' | 'docx' | 'html') => {
    if (onExport) {
      onExport(format);
    }
  };

  // Render risk level badge
  const renderRiskLevelBadge = (level: 'low' | 'medium' | 'high' | 'critical') => {
    const defaultColorClasses: Record<string, string> = {
      low: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      high: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
      critical: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
    };

    return (
      <span className={cx(`px-2 py-1 rounded text-xs font-medium ${defaultColorClasses[level]}`, 'riskBadge')}>
        {level.charAt(0).toUpperCase() + level.slice(1)}
      </span>
    );
  };

  return (
    <div className={`${cx('bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 print:shadow-none print:p-0', 'root')} ${className}`}>
      {/* Report Header */}
      <div className={cx('mb-8 border-b border-gray-200 dark:border-gray-700 pb-6 print:pb-4', 'header')}>
        <div className="flex justify-between items-start">
          <div>
            <h1 className={cx('text-2xl font-bold text-gray-900 dark:text-white mb-2', 'title')}>
              Data Protection Impact Assessment Report
            </h1>
            <h2 className="text-xl text-gray-700 dark:text-gray-300 mb-4">
              {result.title}
            </h2>
          </div>

          {(allowPrint || allowExport) && (
            <div className="flex space-x-2 print:hidden">
              {allowPrint && (
                <button
                  onClick={handlePrint}
                  className={`${cx('px-3 py-1 bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-white rounded hover:bg-gray-300 dark:hover:bg-gray-600', 'printButton')} ${buttonClassName}`}
                >
                  <span className="flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                    </svg>
                    Print
                  </span>
                </button>
              )}

              {allowExport && (
                <div className="relative inline-block">
                  <button
                    onClick={() => handleExport('pdf')}
                    className={`px-3 py-1 bg-[rgb(var(--ndpr-primary))] text-white rounded hover:bg-[rgb(var(--ndpr-primary-hover))] ${buttonClassName}`}
                  >
                    <span className="flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      Export PDF
                    </span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              <span className="font-medium">Assessor:</span> {result.assessor.name}, {result.assessor.role}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              <span className="font-medium">Contact:</span> {result.assessor.email}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              <span className="font-medium">Started:</span> {formatDate(result.startedAt)}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              <span className="font-medium">Completed:</span> {result.completedAt ? formatDate(result.completedAt) : 'In progress'}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              <span className="font-medium">Next review:</span> {result.reviewDate ? formatDate(result.reviewDate) : 'Not scheduled'}
            </p>
          </div>
        </div>
      </div>

      {/* Executive Summary */}
      <div className={cx('mb-8', 'summary')}>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          Executive Summary
        </h2>

        <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-md mb-4">
          <div className="flex items-center mb-2" role="status" aria-live="polite">
            <span className="font-medium mr-2">Overall Risk Level:</span>
            {renderRiskLevelBadge(result.overallRiskLevel)}
          </div>

          <div className={cx('mb-2', 'conclusion')}>
            <span className="font-medium">Conclusion:</span> {result.conclusion}
          </div>

          <div role="status" aria-live="polite">
            <span className="font-medium">Can Proceed:</span> {result.canProceed ? 'Yes' : 'No'}
          </div>
        </div>

        <div>
          <h3 className="font-medium text-gray-900 dark:text-white mb-2">
            Processing Activity Description
          </h3>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            {result.processingDescription}
          </p>

          {result.recommendations && result.recommendations.length > 0 && (
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white mb-2">
                Key Recommendations
              </h3>
              <ul className="list-disc pl-5 text-gray-700 dark:text-gray-300">
                {result.recommendations.map((rec, index) => (
                  <li key={index} className={cx('', 'recommendation')}>{rec}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Identified Risks */}
      <div className="mb-8">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          Identified Risks
        </h2>

        {result.risks.length === 0 ? (
          <p className="text-gray-700 dark:text-gray-300">No risks identified.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className={cx('min-w-full divide-y divide-gray-200 dark:divide-gray-700', 'riskTable')}>
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                    Risk
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                    Likelihood
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                    Impact
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                    Risk Level
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                    Mitigated
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {result.risks.map((risk) => (
                  <tr key={risk.id} className={cx('', 'riskRow')}>
                    <td className="px-6 py-4 whitespace-normal text-sm text-gray-900 dark:text-gray-100">
                      {risk.description}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                      {risk.likelihood} / 5
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                      {risk.impact} / 5
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {renderRiskLevelBadge(risk.level)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                      {risk.mitigated ? (
                        <span className="text-green-600 dark:text-green-400">Yes</span>
                      ) : (
                        <span className="text-red-600 dark:text-red-400">No</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Full Assessment Details */}
      {showFullReport && (
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            Full Assessment Details
          </h2>

          {sections.map((section) => {
            const sectionQuestions = section.questions.filter(question =>
              result.answers[question.id] !== undefined
            );

            if (sectionQuestions.length === 0) {
              return null;
            }

            return (
              <div key={section.id} className="mb-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  {section.title}
                </h3>

                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                          Question
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                          Answer
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                      {sectionQuestions.map((question) => (
                        <tr key={question.id}>
                          <td className="px-6 py-4 whitespace-normal text-sm text-gray-900 dark:text-gray-100">
                            {question.text}
                          </td>
                          <td className="px-6 py-4 whitespace-normal text-sm text-gray-600 dark:text-gray-400">
                            {getAnswerText(question.id)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Footer */}
      <div className="mt-8 pt-4 border-t border-gray-200 dark:border-gray-700 text-sm text-gray-600 dark:text-gray-400">
        <p>This DPIA was conducted in accordance with the Nigeria Data Protection Act (NDPA) 2023.</p>
        <p>DPIA Report Version: {result.version}</p>
        <p>Generated on: {generatedDate}</p>
      </div>
    </div>
  );
};
