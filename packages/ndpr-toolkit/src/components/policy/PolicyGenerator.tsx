import React, { useState, useEffect } from 'react';
import { generatePolicyText } from '../../utils/privacy';
import { PolicySection, PolicyVariable } from '../../types/privacy';

// Using PolicySection and PolicyVariable from types/privacy.ts

export interface PolicyGeneratorProps {
  /**
   * List of policy sections
   */
  sections: PolicySection[];
  
  /**
   * List of policy variables
   */
  variables: PolicyVariable[];
  
  /**
   * Callback function called when the policy is generated
   */
  onGenerate: (policy: { sections: PolicySection[], variables: PolicyVariable[], content: string }) => void;
  
  /**
   * Title displayed on the generator
   * @default "NDPA Privacy Policy Generator"
   */
  title?: string;

  /**
   * Description text displayed on the generator
   * @default "Generate an NDPA-compliant privacy policy for your organization."
   */
  description?: string;
  
  /**
   * Custom CSS class for the generator
   */
  className?: string;
  
  /**
   * Custom CSS class for the buttons
   */
  buttonClassName?: string;
  
  /**
   * Text for the generate button
   * @default "Generate Policy"
   */
  generateButtonText?: string;
  
  /**
   * Whether to show a preview of the generated policy
   * @default true
   */
  showPreview?: boolean;
  
  /**
   * Whether to allow editing the policy content
   * @default true
   */
  allowEditing?: boolean;
}

export const PolicyGenerator: React.FC<PolicyGeneratorProps> = ({
  sections: initialSections,
  variables: initialVariables,
  onGenerate,
  title = "NDPA Privacy Policy Generator",
  description = "Generate an NDPA-compliant privacy policy for your organization.",
  className = "",
  buttonClassName = "",
  generateButtonText = "Generate Policy",
  showPreview = true,
  allowEditing = true
}) => {
  const [sections, setSections] = useState<PolicySection[]>(initialSections);
  const [variables, setVariables] = useState<PolicyVariable[]>(initialVariables);
  const [activeStep, setActiveStep] = useState<'sections' | 'variables' | 'preview'>('sections');
  const [generatedPolicy, setGeneratedPolicy] = useState<string>('');
  const [editedPolicy, setEditedPolicy] = useState<string>('');
  const [isGenerated, setIsGenerated] = useState<boolean>(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Update sections when initialSections changes
  useEffect(() => {
    setSections(initialSections);
  }, [initialSections]);
  
  // Update variables when initialVariables changes
  useEffect(() => {
    setVariables(initialVariables);
  }, [initialVariables]);
  
  // Handle section toggle
  const handleSectionToggle = (sectionId: string) => {
    setSections(prevSections => 
      prevSections.map(section => 
        section.id === sectionId 
          ? { ...section, included: !section.included } 
          : section
      )
    );
  };
  
  // Handle variable change
  const handleVariableChange = (variableId: string, value: string) => {
    setVariables(prevVariables => 
      prevVariables.map(variable => 
        variable.id === variableId 
          ? { ...variable, value } 
          : variable
      )
    );
    
    // Clear error for this variable if it exists
    if (errors[variableId]) {
      setErrors(prevErrors => {
        const newErrors = { ...prevErrors };
        delete newErrors[variableId];
        return newErrors;
      });
    }
  };
  
  // Validate variables
  const validateVariables = (): boolean => {
    const newErrors: Record<string, string> = {};
    let isValid = true;
    
    variables.forEach(variable => {
      if (variable.required && !variable.value) {
        newErrors[variable.id] = `${variable.name} is required`;
        isValid = false;
      }
    });
    
    setErrors(newErrors);
    return isValid;
  };
  
  // Generate policy
  const generatePolicy = () => {
    if (!validateVariables()) {
      setActiveStep('variables');
      return;
    }
    
    const includedSections = sections.filter(section => section.included);
    const variableMap = Object.fromEntries(
      variables.map(variable => [variable.name, variable.value])
    );
    
    let policyContent = '';
    
    includedSections.forEach(section => {
      policyContent += `## ${section.title}\n\n`;
      policyContent += generatePolicyText(section.template, variableMap);
      policyContent += '\n\n';
    });
    
    setGeneratedPolicy(policyContent);
    setEditedPolicy(policyContent);
    setIsGenerated(true);
    setActiveStep('preview');
  };
  
  // Handle policy submission
  const handleSubmit = () => {
    const policy = {
      sections,
      variables,
      content: allowEditing ? editedPolicy : generatedPolicy
    };
    
    onGenerate(policy);
  };
  
  // Render section list
  const renderSectionList = () => {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-medium mb-4">Select Policy Sections</h3>
        
        {sections.map(section => (
          <div key={section.id} className="border border-gray-200 dark:border-gray-700 rounded-md p-4">
            <div className="flex items-start">
              <div className="flex items-center h-5">
                <input
                  id={`section-${section.id}`}
                  type="checkbox"
                  checked={section.included}
                  onChange={() => handleSectionToggle(section.id)}
                  disabled={section.required}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:focus:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                />
              </div>
              <div className="ml-3 text-sm">
                <label htmlFor={`section-${section.id}`} className="font-medium text-gray-900 dark:text-white">
                  {section.title} {section.required && <span className="text-red-500">*</span>}
                </label>
                {section.description && (
                  <p className="text-gray-500 dark:text-gray-400 mt-1">{section.description}</p>
                )}
              </div>
            </div>
          </div>
        ))}
        
        <div className="mt-6">
          <button
            onClick={() => setActiveStep('variables')}
            className={`px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 ${buttonClassName}`}
          >
            Next: Fill Variables
          </button>
        </div>
      </div>
    );
  };
  
  // Render variable form
  const renderVariableForm = () => {
    // Group variables by section
    const variablesBySection: Record<string, PolicyVariable[]> = {};
    
    variables.forEach(variable => {
      const sectionId = variable.id.split('.')[0];
      if (!variablesBySection[sectionId]) {
        variablesBySection[sectionId] = [];
      }
      variablesBySection[sectionId].push(variable);
    });
    
    return (
      <div>
        <h3 className="text-lg font-medium mb-4">Fill Policy Variables</h3>
        
        <div className="space-y-6">
          {Object.entries(variablesBySection).map(([sectionId, sectionVariables]) => {
            const section = sections.find(s => s.id === sectionId);
            
            // Skip sections that are not included
            if (section && !section.included) {
              return null;
            }
            
            return (
              <div key={sectionId} className="border border-gray-200 dark:border-gray-700 rounded-md p-4">
                <h4 className="font-medium text-lg mb-3">
                  {section ? section.title : 'General Information'}
                </h4>
                
                <div className="space-y-4">
                  {sectionVariables.map(variable => (
                    <div key={variable.id}>
                      <label htmlFor={`var-${variable.id}`} className="block text-sm font-medium mb-1">
                        {variable.name} {variable.required && <span className="text-red-500">*</span>}
                      </label>
                      
                      {variable.description && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                          {variable.description}
                        </p>
                      )}
                      
                      {variable.inputType === 'textarea' ? (
                        <textarea
                          id={`var-${variable.id}`}
                          value={variable.value}
                          onChange={e => handleVariableChange(variable.id, e.target.value)}
                          rows={4}
                          className={`w-full px-3 py-2 border ${
                            errors[variable.id] 
                              ? 'border-red-500 focus:ring-red-500' 
                              : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500'
                          } rounded-md focus:outline-none focus:ring-2`}
                          required={variable.required}
                        />
                      ) : variable.inputType === 'select' && variable.options ? (
                        <select
                          id={`var-${variable.id}`}
                          value={variable.value}
                          onChange={e => handleVariableChange(variable.id, e.target.value)}
                          className={`w-full px-3 py-2 border ${
                            errors[variable.id] 
                              ? 'border-red-500 focus:ring-red-500' 
                              : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500'
                          } rounded-md focus:outline-none focus:ring-2`}
                          required={variable.required}
                        >
                          <option value="">Select an option</option>
                          {variable.options.map(option => (
                            <option key={option} value={option}>{option}</option>
                          ))}
                        </select>
                      ) : (
                        <input
                          id={`var-${variable.id}`}
                          type={variable.inputType}
                          value={variable.value}
                          onChange={e => handleVariableChange(variable.id, e.target.value)}
                          className={`w-full px-3 py-2 border ${
                            errors[variable.id] 
                              ? 'border-red-500 focus:ring-red-500' 
                              : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500'
                          } rounded-md focus:outline-none focus:ring-2`}
                          required={variable.required}
                        />
                      )}
                      
                      {errors[variable.id] && (
                        <p className="mt-1 text-sm text-red-600 dark:text-red-500">
                          {errors[variable.id]}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
        
        <div className="mt-6 flex space-x-4">
          <button
            onClick={() => setActiveStep('sections')}
            className={`px-4 py-2 bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-white rounded hover:bg-gray-300 dark:hover:bg-gray-600 ${buttonClassName}`}
          >
            Back to Sections
          </button>
          <button
            onClick={generatePolicy}
            className={`px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 ${buttonClassName}`}
          >
            {generateButtonText}
          </button>
        </div>
      </div>
    );
  };
  
  // Render policy preview
  const renderPolicyPreview = () => {
    return (
      <div>
        <h3 className="text-lg font-medium mb-4">Preview Generated Policy</h3>
        
        {allowEditing ? (
          <div className="mb-4">
            <label htmlFor="policy-content" className="block text-sm font-medium mb-1">
              Edit Policy Content
            </label>
            <textarea
              id="policy-content"
              value={editedPolicy}
              onChange={e => setEditedPolicy(e.target.value)}
              rows={20}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
            />
          </div>
        ) : (
          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-md mb-4">
            <div className="prose dark:prose-invert max-w-none">
              {generatedPolicy.split('\n').map((line, index) => {
                if (line.startsWith('## ')) {
                  return <h2 key={index} className="text-xl font-bold mt-6 mb-3">{line.substring(3)}</h2>;
                } else if (line.startsWith('### ')) {
                  return <h3 key={index} className="text-lg font-bold mt-4 mb-2">{line.substring(4)}</h3>;
                } else if (line === '') {
                  return <br key={index} />;
                } else {
                  return <p key={index} className="mb-2">{line}</p>;
                }
              })}
            </div>
          </div>
        )}
        
        <div className="mt-6 flex space-x-4">
          <button
            onClick={() => setActiveStep('variables')}
            className={`px-4 py-2 bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-white rounded hover:bg-gray-300 dark:hover:bg-gray-600 ${buttonClassName}`}
          >
            Back to Variables
          </button>
          <button
            onClick={handleSubmit}
            className={`px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 ${buttonClassName}`}
          >
            Save Policy
          </button>
        </div>
      </div>
    );
  };
  
  // Render the current step
  const renderStep = () => {
    switch (activeStep) {
      case 'sections':
        return renderSectionList();
      case 'variables':
        return renderVariableForm();
      case 'preview':
        return renderPolicyPreview();
      default:
        return renderSectionList();
    }
  };
  
  return (
    <div className={`bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md ${className}`}>
      <h2 className="text-xl font-bold mb-2">{title}</h2>
      <p className="mb-6 text-gray-600 dark:text-gray-300">{description}</p>
      
      {/* Steps Indicator */}
      <div className="mb-8">
        <ol className="flex items-center w-full">
          <li className={`flex w-full items-center ${activeStep === 'sections' ? 'text-blue-600 dark:text-blue-500' : 'text-gray-500 dark:text-gray-400'} after:content-[''] after:w-full after:h-1 after:border-b after:border-gray-200 after:border-1 after:hidden sm:after:inline-block after:mx-6 xl:after:mx-10`}>
            <span className={`flex items-center justify-center w-8 h-8 ${activeStep === 'sections' ? 'bg-blue-100 dark:bg-blue-800' : 'bg-gray-100 dark:bg-gray-700'} rounded-full shrink-0`}>
              1
            </span>
            <span className="hidden sm:inline-flex sm:ml-2">Sections</span>
          </li>
          <li className={`flex w-full items-center ${activeStep === 'variables' ? 'text-blue-600 dark:text-blue-500' : 'text-gray-500 dark:text-gray-400'} after:content-[''] after:w-full after:h-1 after:border-b after:border-gray-200 after:border-1 after:hidden sm:after:inline-block after:mx-6 xl:after:mx-10`}>
            <span className={`flex items-center justify-center w-8 h-8 ${activeStep === 'variables' ? 'bg-blue-100 dark:bg-blue-800' : 'bg-gray-100 dark:bg-gray-700'} rounded-full shrink-0`}>
              2
            </span>
            <span className="hidden sm:inline-flex sm:ml-2">Variables</span>
          </li>
          <li className={`flex items-center ${activeStep === 'preview' ? 'text-blue-600 dark:text-blue-500' : 'text-gray-500 dark:text-gray-400'}`}>
            <span className={`flex items-center justify-center w-8 h-8 ${activeStep === 'preview' ? 'bg-blue-100 dark:bg-blue-800' : 'bg-gray-100 dark:bg-gray-700'} rounded-full shrink-0`}>
              3
            </span>
            <span className="hidden sm:inline-flex sm:ml-2">Preview</span>
          </li>
        </ol>
      </div>
      
      {/* NDPA Notice */}
      <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-md">
        <h3 className="text-sm font-bold text-blue-800 dark:text-blue-200 mb-2">NDPA Compliance Notice</h3>
        <p className="text-blue-700 dark:text-blue-300 text-sm">
          This tool helps you generate a privacy policy that aligns with the Nigeria Data Protection Act (NDPA) 2023.
          While we strive to ensure compliance, we recommend having the final policy reviewed by a legal professional
          familiar with NDPA requirements.
        </p>
      </div>
      
      {/* Current Step Content */}
      {renderStep()}
    </div>
  );
};
