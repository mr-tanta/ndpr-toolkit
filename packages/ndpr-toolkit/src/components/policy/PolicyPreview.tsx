import React, { useState } from 'react';
import { PolicySection, PolicyVariable } from '../../types/privacy';

export interface PolicyPreviewProps {
  /**
   * The policy content to preview
   */
  content: string;
  
  /**
   * The policy sections
   */
  sections?: PolicySection[];
  
  /**
   * The policy variables
   */
  variables?: PolicyVariable[];
  
  /**
   * Callback function called when the policy is exported
   */
  onExport?: (format: 'pdf' | 'html' | 'markdown' | 'docx') => void;
  
  /**
   * Callback function called when the policy is edited
   */
  onEdit?: () => void;
  
  /**
   * Title displayed on the preview
   * @default "Privacy Policy Preview"
   */
  title?: string;
  
  /**
   * Description text displayed on the preview
   * @default "Preview your NDPR-compliant privacy policy before exporting."
   */
  description?: string;
  
  /**
   * Custom CSS class for the preview
   */
  className?: string;
  
  /**
   * Custom CSS class for the buttons
   */
  buttonClassName?: string;
  
  /**
   * Whether to show the export options
   * @default true
   */
  showExportOptions?: boolean;
  
  /**
   * Whether to show the edit button
   * @default true
   */
  showEditButton?: boolean;
  
  /**
   * Whether to show the table of contents
   * @default true
   */
  showTableOfContents?: boolean;
  
  /**
   * Whether to show the policy metadata
   * @default true
   */
  showMetadata?: boolean;
  
  /**
   * The organization name to display in the policy
   */
  organizationName?: string;
  
  /**
   * The last updated date to display in the policy
   */
  lastUpdated?: Date;
}

export const PolicyPreview: React.FC<PolicyPreviewProps> = ({
  content,
  sections,
  variables,
  onExport,
  onEdit,
  title = "Privacy Policy Preview",
  description = "Preview your NDPR-compliant privacy policy before exporting.",
  className = "",
  buttonClassName = "",
  showExportOptions = true,
  showEditButton = true,
  showTableOfContents = true,
  showMetadata = true,
  organizationName,
  lastUpdated = new Date()
}) => {
  const [activeTab, setActiveTab] = useState<'preview' | 'markdown'>('preview');
  
  // Parse the content to extract section titles for the table of contents
  const extractSectionTitles = (): { id: string, title: string, level: number }[] => {
    const lines = content.split('\n');
    const sectionTitles: { id: string, title: string, level: number }[] = [];
    
    lines.forEach(line => {
      if (line.startsWith('## ')) {
        const title = line.substring(3).trim();
        const id = title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        sectionTitles.push({ id, title, level: 2 });
      } else if (line.startsWith('### ')) {
        const title = line.substring(4).trim();
        const id = title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        sectionTitles.push({ id, title, level: 3 });
      }
    });
    
    return sectionTitles;
  };
  
  // Get the section titles for the table of contents
  const sectionTitles = extractSectionTitles();
  
  // Handle export button click
  const handleExport = (format: 'pdf' | 'html' | 'markdown' | 'docx') => {
    if (onExport) {
      onExport(format);
    } else {
      // Fallback export functionality
      if (format === 'markdown') {
        const element = document.createElement('a');
        const file = new Blob([content], {type: 'text/markdown'});
        element.href = URL.createObjectURL(file);
        element.download = `privacy-policy-${new Date().toISOString().split('T')[0]}.md`;
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
      }
    }
  };
  
  // Render the table of contents
  const renderTableOfContents = () => {
    if (!showTableOfContents || sectionTitles.length === 0) {
      return null;
    }
    
    return (
      <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-md">
        <h3 className="text-lg font-medium mb-3">Table of Contents</h3>
        <ul className="space-y-1">
          {sectionTitles.map((section, index) => (
            <li key={index} style={{ marginLeft: `${(section.level - 2) * 1.5}rem` }}>
              <a 
                href={`#${section.id}`} 
                className="text-blue-600 dark:text-blue-400 hover:underline"
              >
                {section.title}
              </a>
            </li>
          ))}
        </ul>
      </div>
    );
  };
  
  // Render the policy metadata
  const renderMetadata = () => {
    if (!showMetadata) {
      return null;
    }
    
    return (
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">
          {organizationName ? `${organizationName} Privacy Policy` : 'Privacy Policy'}
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Last Updated: {lastUpdated.toLocaleDateString()}
        </p>
      </div>
    );
  };
  
  // Render the policy content in HTML format
  const renderHTMLContent = () => {
    return (
      <div className="prose dark:prose-invert max-w-none">
        {content.split('\n').map((line, index) => {
          if (line.startsWith('## ')) {
            const title = line.substring(3).trim();
            const id = title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
            return <h2 id={id} key={index} className="text-xl font-bold mt-6 mb-3">{title}</h2>;
          } else if (line.startsWith('### ')) {
            const title = line.substring(4).trim();
            const id = title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
            return <h3 id={id} key={index} className="text-lg font-bold mt-4 mb-2">{title}</h3>;
          } else if (line === '') {
            return <br key={index} />;
          } else {
            return <p key={index} className="mb-2">{line}</p>;
          }
        })}
      </div>
    );
  };
  
  // Render the export options
  const renderExportOptions = () => {
    if (!showExportOptions) {
      return null;
    }
    
    return (
      <div className="mt-6">
        <h3 className="text-lg font-medium mb-3">Export Options</h3>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => handleExport('pdf')}
            className={`px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 ${buttonClassName}`}
          >
            Export as PDF
          </button>
          <button
            onClick={() => handleExport('docx')}
            className={`px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 ${buttonClassName}`}
          >
            Export as DOCX
          </button>
          <button
            onClick={() => handleExport('html')}
            className={`px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 ${buttonClassName}`}
          >
            Export as HTML
          </button>
          <button
            onClick={() => handleExport('markdown')}
            className={`px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 ${buttonClassName}`}
          >
            Export as Markdown
          </button>
        </div>
      </div>
    );
  };
  
  return (
    <div className={`bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md ${className}`}>
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-xl font-bold mb-2">{title}</h2>
          <p className="text-gray-600 dark:text-gray-300">{description}</p>
        </div>
        
        {showEditButton && onEdit && (
          <button
            onClick={onEdit}
            className={`px-4 py-2 bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-white rounded hover:bg-gray-300 dark:hover:bg-gray-600 ${buttonClassName}`}
          >
            Edit Policy
          </button>
        )}
      </div>
      
      {/* NDPR Notice */}
      <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-md">
        <h3 className="text-sm font-bold text-blue-800 dark:text-blue-200 mb-2">NDPR Compliance Notice</h3>
        <p className="text-blue-700 dark:text-blue-300 text-sm">
          This privacy policy has been generated to align with the Nigeria Data Protection Regulation (NDPR).
          We recommend having the final policy reviewed by a legal professional familiar with NDPR requirements
          before publishing it on your website or sharing it with your users.
        </p>
      </div>
      
      {/* Tabs */}
      <div className="mb-6 border-b border-gray-200 dark:border-gray-700">
        <ul className="flex flex-wrap -mb-px">
          <li className="mr-2">
            <button
              onClick={() => setActiveTab('preview')}
              className={`inline-block p-4 ${
                activeTab === 'preview'
                  ? 'text-blue-600 border-b-2 border-blue-600 dark:text-blue-500 dark:border-blue-500'
                  : 'text-gray-500 hover:text-gray-600 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              Preview
            </button>
          </li>
          <li className="mr-2">
            <button
              onClick={() => setActiveTab('markdown')}
              className={`inline-block p-4 ${
                activeTab === 'markdown'
                  ? 'text-blue-600 border-b-2 border-blue-600 dark:text-blue-500 dark:border-blue-500'
                  : 'text-gray-500 hover:text-gray-600 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              Markdown
            </button>
          </li>
        </ul>
      </div>
      
      {/* Content */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-md">
        {activeTab === 'preview' ? (
          <div>
            {renderMetadata()}
            {renderTableOfContents()}
            <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-md">
              {renderHTMLContent()}
            </div>
          </div>
        ) : (
          <div>
            <pre className="bg-gray-50 dark:bg-gray-700 p-4 rounded-md overflow-auto whitespace-pre-wrap font-mono text-sm text-gray-800 dark:text-gray-200">
              {content}
            </pre>
          </div>
        )}
      </div>
      
      {/* Export Options */}
      {renderExportOptions()}
    </div>
  );
};
