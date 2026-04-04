import React, { useState } from 'react';

export interface PolicyExporterProps {
  /**
   * The policy content to export
   */
  content: string;
  
  /**
   * The policy title
   */
  title?: string;
  
  /**
   * The organization name to include in the exported policy
   */
  organizationName?: string;
  
  /**
   * The last updated date to include in the exported policy
   */
  lastUpdated?: Date;
  
  /**
   * Callback function called when the export is complete
   */
  onExportComplete?: (format: string, url: string) => void;
  
  /**
   * Title displayed on the exporter
   * @default "Export Privacy Policy"
   */
  componentTitle?: string;
  
  /**
   * Description text displayed on the exporter
   * @default "Export your NDPA-compliant privacy policy in various formats."
   */
  description?: string;
  
  /**
   * Custom CSS class for the exporter
   */
  className?: string;
  
  /**
   * Custom CSS class for the buttons
   */
  buttonClassName?: string;
  
  /**
   * Whether to show the export history
   * @default true
   */
  showExportHistory?: boolean;
  
  /**
   * Whether to include the NDPA compliance notice in the exported policy
   * @default true
   */
  includeComplianceNotice?: boolean;
  
  /**
   * Whether to include the organization logo in the exported policy
   * @default false
   */
  includeLogo?: boolean;
  
  /**
   * URL of the organization logo
   */
  logoUrl?: string;
  
  /**
   * Custom CSS styles for the exported policy
   */
  customStyles?: string;
}

interface ExportRecord {
  id: string;
  format: string;
  timestamp: number;
  url: string;
  filename: string;
}

export const PolicyExporter: React.FC<PolicyExporterProps> = ({
  content,
  title = "Privacy Policy",
  organizationName,
  lastUpdated = new Date(),
  onExportComplete,
  componentTitle = "Export Privacy Policy",
  description = "Export your NDPA-compliant privacy policy in various formats.",
  className = "",
  buttonClassName = "",
  showExportHistory = true,
  includeComplianceNotice = true,
  includeLogo = false,
  logoUrl,
  customStyles
}) => {
  const [exportHistory, setExportHistory] = useState<ExportRecord[]>([]);
  const [selectedFormat, setSelectedFormat] = useState<string>('pdf');
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [exportError, setExportError] = useState<string | null>(null);
  const [customFilename, setCustomFilename] = useState<string>('');
  const [customHeader, setCustomHeader] = useState<string>('');
  const [customFooter, setCustomFooter] = useState<string>('');
  const [showAdvancedOptions, setShowAdvancedOptions] = useState<boolean>(false);
  
  // Generate a default filename based on the organization name and format
  const generateDefaultFilename = (format: string): string => {
    const dateStr = new Date().toISOString().split('T')[0];
    const orgStr = organizationName ? 
      organizationName.toLowerCase().replace(/[^a-z0-9]+/g, '-') : 
      'privacy-policy';
    
    return `${orgStr}-privacy-policy-${dateStr}.${format.toLowerCase()}`;
  };
  
  // Get the actual filename to use
  const getFilename = (format: string): string => {
    if (customFilename) {
      // Ensure the filename has the correct extension
      if (customFilename.endsWith(`.${format.toLowerCase()}`)) {
        return customFilename;
      } else {
        return `${customFilename}.${format.toLowerCase()}`;
      }
    }
    
    return generateDefaultFilename(format);
  };
  
  // Generate HTML content for export
  const generateHTMLContent = (): string => {
    const fullTitle = organizationName ? `${organizationName} ${title}` : title;
    const dateStr = lastUpdated.toLocaleDateString();
    
    let html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${fullTitle}</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
    }
    h1 {
      font-size: 24px;
      margin-bottom: 10px;
    }
    h2 {
      font-size: 20px;
      margin-top: 30px;
      margin-bottom: 10px;
      border-bottom: 1px solid #eee;
      padding-bottom: 5px;
    }
    h3 {
      font-size: 18px;
      margin-top: 20px;
      margin-bottom: 10px;
    }
    p {
      margin-bottom: 15px;
    }
    .header {
      text-align: center;
      margin-bottom: 30px;
    }
    .footer {
      margin-top: 50px;
      text-align: center;
      font-size: 12px;
      color: #666;
      border-top: 1px solid #eee;
      padding-top: 20px;
    }
    .logo {
      max-width: 200px;
      margin-bottom: 20px;
    }
    .last-updated {
      font-size: 12px;
      color: #666;
      margin-bottom: 30px;
    }
    .compliance-notice {
      background-color: #f8f9fa;
      border: 1px solid #e9ecef;
      padding: 15px;
      margin-bottom: 30px;
      font-size: 14px;
    }
    ${customStyles || ''}
  </style>
</head>
<body>
  <div class="header">
    ${includeLogo && logoUrl ? `<img src="${logoUrl}" alt="${organizationName || 'Company'} Logo" class="logo">` : ''}
    ${customHeader ? `<div class="custom-header">${customHeader}</div>` : ''}
    <h1>${fullTitle}</h1>
    <div class="last-updated">Last Updated: ${dateStr}</div>
  </div>`;
  
    if (includeComplianceNotice) {
      html += `
  <div class="compliance-notice">
    <strong>NDPA Compliance Notice:</strong> This privacy policy has been created to comply with the Nigeria Data Protection Act (NDPA) 2023.
    It outlines how we collect, use, disclose, and protect your personal information in accordance with NDPA requirements.
  </div>`;
    }
    
    // Convert markdown content to HTML
    const htmlContent = content
      .replace(/^## (.*?)$/gm, '<h2>$1</h2>')
      .replace(/^### (.*?)$/gm, '<h3>$1</h3>')
      .replace(/\n\n/g, '</p><p>')
      .replace(/\n/g, '<br>');
    
    html += `
  <div class="content">
    <p>${htmlContent}</p>
  </div>
  
  <div class="footer">
    ${customFooter ? `<div class="custom-footer">${customFooter}</div>` : ''}
    <p>&copy; ${new Date().getFullYear()} ${organizationName || 'Company'}. All rights reserved.</p>
  </div>
</body>
</html>`;
    
    return html;
  };
  
  // Handle export button click
  const handleExport = async () => {
    setIsExporting(true);
    setExportError(null);
    
    try {
      const format = selectedFormat.toLowerCase();
      let url = '';
      let blob: Blob;
      
      switch (format) {
        case 'pdf':
          // In a real implementation, this would use a PDF generation library
          // For this example, we'll just create an HTML file with a note
          const htmlForPdf = generateHTMLContent();
          blob = new Blob([htmlForPdf], { type: 'text/html' });
          url = URL.createObjectURL(blob);
          break;
          
        case 'docx':
          // In a real implementation, this would use a DOCX generation library
          // For this example, we'll just create a text file with a note
          blob = new Blob([content], { type: 'text/plain' });
          url = URL.createObjectURL(blob);
          break;
          
        case 'html':
          const html = generateHTMLContent();
          blob = new Blob([html], { type: 'text/html' });
          url = URL.createObjectURL(blob);
          break;
          
        case 'markdown':
        default:
          blob = new Blob([content], { type: 'text/markdown' });
          url = URL.createObjectURL(blob);
          break;
      }
      
      // Create a download link and trigger it
      const filename = getFilename(format);
      const element = document.createElement('a');
      element.href = url;
      element.download = filename;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
      
      // Add to export history
      const exportRecord: ExportRecord = {
        id: `export_${Date.now()}`,
        format,
        timestamp: Date.now(),
        url,
        filename
      };
      
      setExportHistory(prevHistory => [exportRecord, ...prevHistory]);
      
      // Call the callback
      if (onExportComplete) {
        onExportComplete(format, url);
      }
    } catch (error) {
      console.error('Export error:', error);
      setExportError('An error occurred during export. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };
  
  // Render export format options
  const renderFormatOptions = () => {
    const formats = [
      { value: 'pdf', label: 'PDF Document (.pdf)' },
      { value: 'docx', label: 'Word Document (.docx)' },
      { value: 'html', label: 'Web Page (.html)' },
      { value: 'markdown', label: 'Markdown (.md)' }
    ];
    
    return (
      <div className="mb-6">
        <label htmlFor="export-format" className="block text-sm font-medium mb-1">
          Export Format
        </label>
        <select
          id="export-format"
          value={selectedFormat}
          onChange={e => setSelectedFormat(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {formats.map(format => (
            <option key={format.value} value={format.value}>
              {format.label}
            </option>
          ))}
        </select>
      </div>
    );
  };
  
  // Render advanced options
  const renderAdvancedOptions = () => {
    if (!showAdvancedOptions) {
      return (
        <button
          type="button"
          onClick={() => setShowAdvancedOptions(true)}
          className="text-blue-600 dark:text-blue-400 text-sm mb-6"
        >
          Show Advanced Options
        </button>
      );
    }
    
    return (
      <div className="mb-6 space-y-4 border border-gray-200 dark:border-gray-700 rounded-md p-4">
        <div className="flex justify-between items-center">
          <h3 className="text-md font-medium">Advanced Export Options</h3>
          <button
            type="button"
            onClick={() => setShowAdvancedOptions(false)}
            className="text-blue-600 dark:text-blue-400 text-sm"
          >
            Hide Advanced Options
          </button>
        </div>
        
        <div>
          <label htmlFor="custom-filename" className="block text-sm font-medium mb-1">
            Custom Filename
          </label>
          <input
            type="text"
            id="custom-filename"
            value={customFilename}
            onChange={e => setCustomFilename(e.target.value)}
            placeholder={generateDefaultFilename(selectedFormat)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Leave blank to use the default filename format.
          </p>
        </div>
        
        <div>
          <label htmlFor="custom-header" className="block text-sm font-medium mb-1">
            Custom Header HTML (for HTML/PDF exports)
          </label>
          <textarea
            id="custom-header"
            value={customHeader}
            onChange={e => setCustomHeader(e.target.value)}
            rows={3}
            placeholder="<div>Custom header content</div>"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <div>
          <label htmlFor="custom-footer" className="block text-sm font-medium mb-1">
            Custom Footer HTML (for HTML/PDF exports)
          </label>
          <textarea
            id="custom-footer"
            value={customFooter}
            onChange={e => setCustomFooter(e.target.value)}
            rows={3}
            placeholder="<div>Custom footer content</div>"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <div className="flex items-start">
          <div className="flex items-center h-5">
            <input
              id="include-compliance-notice"
              type="checkbox"
              checked={includeComplianceNotice}
              onChange={e => setShowAdvancedOptions(e.target.checked)}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:focus:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
            />
          </div>
          <div className="ml-3 text-sm">
            <label htmlFor="include-compliance-notice" className="font-medium text-gray-900 dark:text-white">
              Include NDPA Compliance Notice
            </label>
            <p className="text-gray-500 dark:text-gray-400">
              Adds a notice explaining that this policy complies with NDPA requirements.
            </p>
          </div>
        </div>
      </div>
    );
  };
  
  // Render export history
  const renderExportHistory = () => {
    if (!showExportHistory || exportHistory.length === 0) {
      return null;
    }
    
    return (
      <div className="mt-6">
        <h3 className="text-lg font-medium mb-3">Export History</h3>
        <div className="bg-gray-50 dark:bg-gray-700 rounded-md overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-600">
            <thead className="bg-gray-100 dark:bg-gray-800">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Date
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Format
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Filename
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-700 divide-y divide-gray-200 dark:divide-gray-600">
              {exportHistory.map(record => (
                <tr key={record.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                    {new Date(record.timestamp).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                    {record.format.toUpperCase()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                    {record.filename}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <a 
                      href={record.url} 
                      download={record.filename}
                      className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 mr-4"
                    >
                      Download
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };
  
  return (
    <div className={`bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md ${className}`}>
      <h2 className="text-xl font-bold mb-2">{componentTitle}</h2>
      <p className="mb-6 text-gray-600 dark:text-gray-300">{description}</p>
      
      {/* Format Selection */}
      {renderFormatOptions()}
      
      {/* Advanced Options */}
      {renderAdvancedOptions()}
      
      {/* Export Button */}
      <div className="mb-6">
        <button
          onClick={handleExport}
          disabled={isExporting}
          className={`px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${buttonClassName} ${isExporting ? 'opacity-70 cursor-not-allowed' : ''}`}
        >
          {isExporting ? 'Exporting...' : `Export as ${selectedFormat.toUpperCase()}`}
        </button>
        
        {exportError && (
          <p className="mt-2 text-sm text-red-600 dark:text-red-500">
            {exportError}
          </p>
        )}
      </div>
      
      {/* Export Tips */}
      <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-md">
        <h3 className="text-sm font-bold text-blue-800 dark:text-blue-200 mb-2">Export Tips</h3>
        <ul className="text-blue-700 dark:text-blue-300 text-sm list-disc list-inside space-y-1">
          <li>PDF format is recommended for printing or sharing with stakeholders.</li>
          <li>HTML format is ideal for publishing on your website.</li>
          <li>DOCX format allows for further editing in Microsoft Word or similar applications.</li>
          <li>Markdown format is useful for version control systems or technical documentation.</li>
        </ul>
      </div>
      
      {/* Export History */}
      {renderExportHistory()}
    </div>
  );
};
