import { useState, useEffect } from 'react';
import { DPIAQuestion, DPIASection, DPIAResult, DPIARisk } from '../types/dpia';
import { assessDPIARisk } from '../utils/dpia';

interface UseDPIAOptions {
  /**
   * Sections of the DPIA questionnaire
   */
  sections: DPIASection[];
  
  /**
   * Initial answers (if resuming a DPIA)
   */
  initialAnswers?: Record<string, any>;
  
  /**
   * Storage key for DPIA data
   * @default "ndpr_dpia_data"
   */
  storageKey?: string;
  
  /**
   * Whether to use local storage to persist DPIA data
   * @default true
   */
  useLocalStorage?: boolean;
  
  /**
   * Callback function called when the DPIA is completed
   */
  onComplete?: (result: DPIAResult) => void;
}

interface UseDPIAReturn {
  /**
   * Current section index
   */
  currentSectionIndex: number;
  
  /**
   * Current section
   */
  currentSection: DPIASection | null;
  
  /**
   * All answers
   */
  answers: Record<string, any>;
  
  /**
   * Update an answer
   */
  updateAnswer: (questionId: string, value: any) => void;
  
  /**
   * Go to the next section
   */
  nextSection: () => boolean;
  
  /**
   * Go to the previous section
   */
  prevSection: () => boolean;
  
  /**
   * Go to a specific section
   */
  goToSection: (index: number) => boolean;
  
  /**
   * Check if the current section is valid
   */
  isCurrentSectionValid: () => boolean;
  
  /**
   * Get validation errors for the current section
   */
  getCurrentSectionErrors: () => Record<string, string>;
  
  /**
   * Check if the DPIA is complete
   */
  isComplete: () => boolean;
  
  /**
   * Complete the DPIA and generate a result
   */
  completeDPIA: (assessorInfo: { name: string; role: string; email: string; }, title: string, processingDescription: string) => DPIAResult;
  
  /**
   * Get the visible questions for the current section
   */
  getVisibleQuestions: () => DPIAQuestion[];
  
  /**
   * Reset the DPIA
   */
  resetDPIA: () => void;
  
  /**
   * Progress percentage
   */
  progress: number;
}

/**
 * Hook for conducting Data Protection Impact Assessments in compliance with the NDPA 2023
 */
export function useDPIA({
  sections,
  initialAnswers = {},
  storageKey = "ndpr_dpia_data",
  useLocalStorage = true,
  onComplete
}: UseDPIAOptions): UseDPIAReturn {
  const [currentSectionIndex, setCurrentSectionIndex] = useState<number>(0);
  const [answers, setAnswers] = useState<Record<string, any>>(initialAnswers);
  
  // Load DPIA data from storage on mount
  useEffect(() => {
    if (useLocalStorage && typeof window !== 'undefined') {
      try {
        const savedData = localStorage.getItem(storageKey);
        if (savedData) {
          const { answers: savedAnswers, sectionIndex } = JSON.parse(savedData);
          setAnswers(savedAnswers || {});
          setCurrentSectionIndex(sectionIndex || 0);
        }
      } catch (error) {
        console.error('Error loading DPIA data:', error);
      }
    }
  }, [storageKey, useLocalStorage]);
  
  // Save DPIA data to storage when it changes
  useEffect(() => {
    if (useLocalStorage && typeof window !== 'undefined') {
      try {
        localStorage.setItem(storageKey, JSON.stringify({
          answers,
          sectionIndex: currentSectionIndex
        }));
      } catch (error) {
        console.error('Error saving DPIA data:', error);
      }
    }
  }, [answers, currentSectionIndex, storageKey, useLocalStorage]);
  
  // Get the current section
  const currentSection = sections[currentSectionIndex] || null;
  
  // Update an answer
  const updateAnswer = (questionId: string, value: any) => {
    setAnswers(prevAnswers => ({
      ...prevAnswers,
      [questionId]: value
    }));
  };
  
  // Check if a question should be shown based on its conditions
  const shouldShowQuestion = (question: DPIAQuestion): boolean => {
    if (!question.showWhen) {
      return true;
    }
    
    return question.showWhen.every(condition => {
      const answer = answers[condition.questionId];
      
      switch (condition.operator) {
        case 'equals':
          return answer === condition.value;
        case 'contains':
          return Array.isArray(answer) ? answer.includes(condition.value) : false;
        case 'greaterThan':
          return typeof answer === 'number' ? answer > condition.value : false;
        case 'lessThan':
          return typeof answer === 'number' ? answer < condition.value : false;
        default:
          return true;
      }
    });
  };
  
  // Get the visible questions for the current section
  const getVisibleQuestions = (): DPIAQuestion[] => {
    if (!currentSection) {
      return [];
    }
    
    return currentSection.questions.filter(shouldShowQuestion);
  };
  
  // Check if the current section is valid
  const isCurrentSectionValid = (): boolean => {
    if (!currentSection) {
      return false;
    }
    
    const visibleQuestions = getVisibleQuestions();
    
    return visibleQuestions.every(question => {
      if (!question.required) {
        return true;
      }
      
      const answer = answers[question.id];
      
      if (answer === undefined || answer === null) {
        return false;
      }
      
      if (typeof answer === 'string' && answer.trim() === '') {
        return false;
      }
      
      if (Array.isArray(answer) && answer.length === 0) {
        return false;
      }
      
      return true;
    });
  };
  
  // Get validation errors for the current section
  const getCurrentSectionErrors = (): Record<string, string> => {
    const errors: Record<string, string> = {};
    
    if (!currentSection) {
      return errors;
    }
    
    const visibleQuestions = getVisibleQuestions();
    
    visibleQuestions.forEach(question => {
      if (!question.required) {
        return;
      }
      
      const answer = answers[question.id];
      
      if (answer === undefined || answer === null) {
        errors[question.id] = 'This question is required';
      } else if (typeof answer === 'string' && answer.trim() === '') {
        errors[question.id] = 'This question is required';
      } else if (Array.isArray(answer) && answer.length === 0) {
        errors[question.id] = 'At least one option must be selected';
      }
    });
    
    return errors;
  };
  
  // Go to the next section
  const nextSection = (): boolean => {
    if (!isCurrentSectionValid()) {
      return false;
    }
    
    if (currentSectionIndex < sections.length - 1) {
      setCurrentSectionIndex(prevIndex => prevIndex + 1);
      return true;
    }
    
    return false;
  };
  
  // Go to the previous section
  const prevSection = (): boolean => {
    if (currentSectionIndex > 0) {
      setCurrentSectionIndex(prevIndex => prevIndex - 1);
      return true;
    }
    
    return false;
  };
  
  // Go to a specific section
  const goToSection = (index: number): boolean => {
    if (index >= 0 && index < sections.length) {
      setCurrentSectionIndex(index);
      return true;
    }
    
    return false;
  };
  
  // Check if the DPIA is complete (pure read — no state mutation)
  const isComplete = (): boolean => {
    return sections.every((section) => {
      const visibleQuestions = section.questions.filter(q => {
        if (!q.showWhen || q.showWhen.length === 0) return true;
        return q.showWhen.some(condition => {
          const answer = answers[condition.questionId];
          switch (condition.operator) {
            case 'equals': return answer === condition.value;
            case 'contains': return Array.isArray(answer) && answer.includes(condition.value);
            case 'greaterThan': return typeof answer === 'number' && answer > condition.value;
            case 'lessThan': return typeof answer === 'number' && answer < condition.value;
            default: return false;
          }
        });
      });

      return visibleQuestions.every(q => {
        if (!q.required) return true;
        const answer = answers[q.id];
        if (answer === undefined || answer === null) return false;
        if (typeof answer === 'string' && answer.trim() === '') return false;
        if (Array.isArray(answer) && answer.length === 0) return false;
        return true;
      });
    });
  };
  
  // Identify risks based on answers
  const identifyRisks = (): DPIARisk[] => {
    const risks: DPIARisk[] = [];
    
    // Check each question for risk indicators
    sections.forEach(section => {
      section.questions.forEach(question => {
        const answer = answers[question.id];
        
        // Skip if no answer
        if (answer === undefined || answer === null) {
          return;
        }
        
        // Check if the question has a risk level
        if (question.riskLevel) {
          // For select/radio/checkbox questions, check if the selected option has a risk level
          if (['select', 'radio', 'checkbox'].includes(question.type) && question.options) {
            const selectedOptions = Array.isArray(answer) ? answer : [answer];
            
            selectedOptions.forEach(selectedOption => {
              const option = question.options?.find(opt => opt.value === selectedOption);
              
              if (option?.riskLevel) {
                const riskLevel = option.riskLevel;
                const likelihood = riskLevel === 'low' ? 1 : riskLevel === 'medium' ? 3 : 5;
                const impact = riskLevel === 'low' ? 1 : riskLevel === 'medium' ? 3 : 5;
                
                risks.push({
                  id: `risk_${risks.length + 1}`,
                  description: `${question.text} - ${option.label}`,
                  likelihood,
                  impact,
                  score: likelihood * impact,
                  level: riskLevel,
                  mitigated: false,
                  relatedQuestionIds: [question.id]
                });
              }
            });
          } else {
            // For other question types, use the question's risk level
            const riskLevel = question.riskLevel;
            const likelihood = riskLevel === 'low' ? 1 : riskLevel === 'medium' ? 3 : 5;
            const impact = riskLevel === 'low' ? 1 : riskLevel === 'medium' ? 3 : 5;
            
            risks.push({
              id: `risk_${risks.length + 1}`,
              description: question.text,
              likelihood,
              impact,
              score: likelihood * impact,
              level: riskLevel,
              mitigated: false,
              relatedQuestionIds: [question.id]
            });
          }
        }
      });
    });
    
    return risks;
  };
  
  // Complete the DPIA and generate a result
  const completeDPIA = (
    assessorInfo: { name: string; role: string; email: string; },
    title: string,
    processingDescription: string
  ): DPIAResult => {
    const risks = identifyRisks();
    
    const result: DPIAResult = {
      id: `dpia_${Date.now()}`,
      title,
      processingDescription,
      startedAt: Date.now(),
      completedAt: Date.now(),
      assessor: assessorInfo,
      answers,
      risks,
      overallRiskLevel: 'low',
      canProceed: true,
      conclusion: '',
      version: '1.0'
    };
    
    // Assess the risks
    const assessment = assessDPIARisk(result);
    
    result.overallRiskLevel = assessment.overallRiskLevel;
    result.canProceed = assessment.canProceed;
    result.conclusion = assessment.canProceed
      ? 'Based on the assessment, the processing can proceed with appropriate safeguards.'
      : 'Based on the assessment, the processing should not proceed without further mitigation measures.';
    result.recommendations = assessment.recommendations;
    
    if (onComplete) {
      onComplete(result);
    }
    
    return result;
  };
  
  // Reset the DPIA
  const resetDPIA = () => {
    setAnswers({});
    setCurrentSectionIndex(0);
    
    if (useLocalStorage && typeof window !== 'undefined') {
      localStorage.removeItem(storageKey);
    }
  };
  
  // Calculate progress percentage
  const progress = (() => {
    let answeredQuestions = 0;
    let totalRequiredQuestions = 0;
    
    sections.forEach(section => {
      section.questions.forEach(question => {
        if (question.required && shouldShowQuestion(question)) {
          totalRequiredQuestions++;
          
          const answer = answers[question.id];
          if (
            answer !== undefined && 
            answer !== null && 
            !(typeof answer === 'string' && answer.trim() === '') &&
            !(Array.isArray(answer) && answer.length === 0)
          ) {
            answeredQuestions++;
          }
        }
      });
    });
    
    return totalRequiredQuestions > 0 
      ? Math.round((answeredQuestions / totalRequiredQuestions) * 100) 
      : 0;
  })();
  
  return {
    currentSectionIndex,
    currentSection,
    answers,
    updateAnswer,
    nextSection,
    prevSection,
    goToSection,
    isCurrentSectionValid,
    getCurrentSectionErrors,
    isComplete,
    completeDPIA,
    getVisibleQuestions,
    resetDPIA,
    progress
  };
}
