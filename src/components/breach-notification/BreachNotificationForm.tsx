'use client';

import { useState } from 'react';
import { BreachSeverity } from '@/types';
import { Input } from '@/components/ui/Input';
import { TextArea } from '@/components/ui/TextArea';
import { Button } from '@/components/ui/Button';
import { FormField } from '@/components/ui/FormField';
import { Checkbox } from '@/components/ui/Checkbox';

interface BreachNotificationFormProps {
  onSubmit: (data: {
    title: string;
    description: string;
    discoveryDate: string;
    affectedDataSubjects: number;
    dataCategories: string[];
    severity: BreachSeverity;
    mitigationSteps: string[];
    reportedToAuthorities: boolean;
    reportedToDataSubjects: boolean;
  }) => void;
  className?: string;
}

export default function BreachNotificationForm({
  onSubmit,
  className = '',
}: BreachNotificationFormProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    discoveryDate: '',
    affectedDataSubjects: 0,
    dataCategories: [] as string[],
    severity: 'medium' as BreachSeverity,
    mitigationSteps: [] as string[],
    reportedToAuthorities: false,
    reportedToDataSubjects: false,
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newMitigationStep, setNewMitigationStep] = useState('');
  const [newDataCategory, setNewDataCategory] = useState('');

  // Default data categories
  const defaultDataCategories = [
    'Personal identifiers (name, ID numbers)',
    'Contact information',
    'Financial information',
    'Health information',
    'Biometric data',
    'Location data',
    'Online identifiers (IP address, cookies)',
    'Credentials (usernames, passwords)',
  ];

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target as HTMLInputElement;
    
    if (type === 'checkbox') {
      setFormData((prev) => ({
        ...prev,
        [name]: (e.target as HTMLInputElement).checked,
      }));
    } else if (type === 'number') {
      setFormData((prev) => ({
        ...prev,
        [name]: parseInt(value) || 0,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
    
    // Clear error when field is edited
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleDataCategoryToggle = (category: string) => {
    setFormData((prev) => {
      const updatedCategories = prev.dataCategories.includes(category)
        ? prev.dataCategories.filter((c) => c !== category)
        : [...prev.dataCategories, category];
      
      return {
        ...prev,
        dataCategories: updatedCategories,
      };
    });
    
    // Clear error when field is edited
    if (errors.dataCategories) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.dataCategories;
        return newErrors;
      });
    }
  };

  const handleAddDataCategory = (e?: React.MouseEvent) => {
    // Prevent form submission if this is triggered by a button click
    if (e) {
      e.preventDefault();
    }
    
    if (newDataCategory.trim()) {
      // Check if category already exists to avoid duplicates
      if (!formData.dataCategories.includes(newDataCategory.trim())) {
        setFormData((prev) => ({
          ...prev,
          dataCategories: [...prev.dataCategories, newDataCategory.trim()],
        }));
      }
      setNewDataCategory('');
      
      // Clear error when field is edited
      if (errors.dataCategories) {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors.dataCategories;
          return newErrors;
        });
      }
    }
  };

  const handleAddMitigationStep = (e?: React.MouseEvent) => {
    // Prevent form submission if this is triggered by a button click
    if (e) {
      e.preventDefault();
    }
    if (newMitigationStep.trim()) {
      setFormData((prev) => ({
        ...prev,
        mitigationSteps: [...prev.mitigationSteps, newMitigationStep.trim()],
      }));
      setNewMitigationStep('');
      
      // Clear error when field is edited
      if (errors.mitigationSteps) {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors.mitigationSteps;
          return newErrors;
        });
      }
    }
  };

  const handleRemoveMitigationStep = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      mitigationSteps: prev.mitigationSteps.filter((_, i) => i !== index),
    }));
  };

  // Handle key press for adding data category and mitigation steps
  const handleKeyPress = (e: React.KeyboardEvent, type: 'category' | 'mitigation') => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (type === 'category') {
        handleAddDataCategory();
      } else {
        handleAddMitigationStep();
      }
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }
    
    if (!formData.discoveryDate) {
      newErrors.discoveryDate = 'Discovery date is required';
    }
    
    if (formData.affectedDataSubjects <= 0) {
      newErrors.affectedDataSubjects = 'Number of affected data subjects must be greater than 0';
    }
    
    if (formData.dataCategories.length === 0) {
      newErrors.dataCategories = 'Please select at least one data category';
    }
    
    if (formData.mitigationSteps.length === 0) {
      newErrors.mitigationSteps = 'Please add at least one mitigation step';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    try {
      // In a real implementation, this would call an API
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate API call
      
      onSubmit({
        title: formData.title,
        description: formData.description,
        discoveryDate: formData.discoveryDate,
        affectedDataSubjects: formData.affectedDataSubjects,
        dataCategories: formData.dataCategories,
        severity: formData.severity,
        mitigationSteps: formData.mitigationSteps,
        reportedToAuthorities: formData.reportedToAuthorities,
        reportedToDataSubjects: formData.reportedToDataSubjects,
      });
    } catch (error) {
      console.error('Error submitting breach notification:', error);
      setErrors({
        submit: 'An error occurred while submitting the breach notification. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={`bg-white dark:bg-gray-800 shadow-sm rounded-lg border border-gray-200 dark:border-gray-700 p-6 ${className}`}>
      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Data Breach Notification Form</h3>

      <form onSubmit={handleSubmit} className="space-y-6">
        <FormField
          id="title"
          label="Breach Title"
          required
          error={errors.title}
        >
          <Input
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Enter title describing the breach"
          />
        </FormField>

        <FormField
          id="description"
          label="Breach Description"
          required
          error={errors.description}
        >
          <TextArea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={4}
            placeholder="Detailed description of what happened, how it happened, and the potential impact"
          />
        </FormField>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            id="discoveryDate"
            label="Date of Discovery"
            required
            error={errors.discoveryDate}
          >
            <Input
              type="date"
              id="discoveryDate"
              name="discoveryDate"
              value={formData.discoveryDate}
              onChange={handleChange}
              max={new Date().toISOString().split('T')[0]}
            />
          </FormField>

          <FormField
            id="affectedDataSubjects"
            label="Number of Affected Data Subjects"
            required
            error={errors.affectedDataSubjects}
          >
            <Input
              type="number"
              id="affectedDataSubjects"
              name="affectedDataSubjects"
              value={formData.affectedDataSubjects}
              onChange={handleChange}
              min={0}
            />
          </FormField>
        </div>

        <FormField
          id="severity"
          label="Breach Severity"
          required
          error={errors.severity}
        >
          <select
            id="severity"
            name="severity"
            value={formData.severity}
            onChange={handleChange}
            className="block w-full px-3 py-2 text-base border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 dark:focus:border-blue-400"
          >
            <option value="low">Low - Minimal impact on data subjects</option>
            <option value="medium">Medium - Moderate impact on data subjects</option>
            <option value="high">High - Significant impact on data subjects</option>
            <option value="critical">Critical - Severe impact on data subjects</option>
          </select>
        </FormField>

        <FormField
          id="dataCategories"
          label="Categories of Data Involved"
          required
          error={errors.dataCategories}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
            {formData.dataCategories.length > 0 && formData.dataCategories.filter(cat => !defaultDataCategories.includes(cat)).length > 0 && (
              <div className="col-span-2 mb-2 p-2 bg-gray-50 dark:bg-gray-800 rounded">
                <h4 className="text-sm font-medium mb-1">Added Categories:</h4>
                <div className="flex flex-wrap gap-2">
                  {formData.dataCategories
                    .filter(cat => !defaultDataCategories.includes(cat))
                    .map((category, index) => (
                      <span key={index} className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                        {category}
                        <button 
                          type="button" 
                          className="ml-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                          onClick={() => {
                            setFormData(prev => ({
                              ...prev,
                              dataCategories: prev.dataCategories.filter(c => c !== category)
                            }));
                          }}
                        >
                          ×
                        </button>
                      </span>
                    ))}
                </div>
              </div>
            )}
            {defaultDataCategories.map((category) => (
              <Checkbox
                key={category}
                id={`category-${category}`}
                label={category}
                checked={formData.dataCategories.includes(category)}
                onChange={() => handleDataCategoryToggle(category)}
              />
            ))}
          </div>
          
          <div className="flex space-x-2 mt-4">
            <Input
              type="text"
              id="newDataCategory"
              value={newDataCategory}
              onChange={(e) => setNewDataCategory(e.target.value)}
              onKeyPress={(e) => handleKeyPress(e, 'category')}
              placeholder="Add other data category"
              className="flex-1"
            />
            <Button
              type="button"
              onClick={(e) => handleAddDataCategory(e)}
              size="sm"
            >
              Add
            </Button>
          </div>
        </FormField>

        <FormField
          id="mitigationSteps"
          label="Mitigation Steps Taken"
          error={errors.mitigationSteps}
        >
          <div className="flex space-x-2 mb-2">
            <Input
              type="text"
              id="newMitigationStep"
              value={newMitigationStep}
              onChange={(e) => setNewMitigationStep(e.target.value)}
              onKeyPress={(e) => handleKeyPress(e, 'mitigation')}
              placeholder="e.g., Changed all passwords, Patched vulnerability"
              className="flex-1"
            />
            <Button
              type="button"
              onClick={(e) => handleAddMitigationStep(e)}
              size="sm"
            >
              Add
            </Button>
          </div>
          
          {formData.mitigationSteps.length > 0 && (
            <ul className="mt-2 space-y-1">
              {formData.mitigationSteps.map((step, index) => (
                <li key={index} className="flex items-center justify-between bg-gray-50 dark:bg-gray-700 p-2 rounded">
                  <span className="text-sm text-gray-700 dark:text-gray-300">{step}</span>
                  <Button
                    type="button"
                    onClick={() => handleRemoveMitigationStep(index)}
                    variant="ghost"
                    size="sm"
                    className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                  >
                    Remove
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </FormField>
        
        <div className="space-y-4">
          <Checkbox
            id="reportedToAuthorities"
            name="reportedToAuthorities"
            checked={formData.reportedToAuthorities}
            onChange={handleChange}
            label="Reported to Nigeria Data Protection Commission (NDPC)"
          />
          
          <Checkbox
            id="reportedToDataSubjects"
            name="reportedToDataSubjects"
            checked={formData.reportedToDataSubjects}
            onChange={handleChange}
            label="Reported to affected data subjects"
          />
        </div>
        
        {errors.submit && (
          <div className="rounded-md bg-red-50 dark:bg-red-900/20 p-4">
            <p className="text-sm text-red-700 dark:text-red-400">{errors.submit}</p>
          </div>
        )}
        
        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={isSubmitting}
            variant="default"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Breach Notification'}
          </Button>
        </div>
      </form>
    </div>
  );
}
