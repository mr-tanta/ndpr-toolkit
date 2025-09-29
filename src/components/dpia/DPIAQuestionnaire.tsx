"use client";

import { useState, useEffect } from "react";
import { RiskAssessmentQuestion } from "@/types";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { TextArea } from "@/components/ui/TextArea";
import { FormField } from "@/components/ui/FormField";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

interface DPIAQuestionnaireProps {
  questions: RiskAssessmentQuestion[];
  onSubmit: (answers: Record<string, number>, projectName: string) => void;
  className?: string;
}

export default function DPIAQuestionnaire({
  questions,
  onSubmit,
  className = "",
}: DPIAQuestionnaireProps) {
  const [projectName, setProjectName] = useState("");
  const [projectDescription, setProjectDescription] = useState("");
  const [dataController, setDataController] = useState("");
  const [assessmentDate, setAssessmentDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [currentStep, setCurrentStep] = useState(0);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [progress, setProgress] = useState(0);

  // Since DPIAQuestion doesn't have a category, we'll create a single category
  const categories: Record<string, RiskAssessmentQuestion[]> = {
    "Assessment Questions": questions,
  };

  const categoryNames = Object.keys(categories);

  const handleAnswerChange = (questionId: string, value: number | string) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: typeof value === "string" ? parseInt(value, 10) : value,
    }));

    // Clear error when question is answered
    if (errors[questionId]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[questionId];
        return newErrors;
      });
    }
  };

  // Render different input types based on question type
  const renderQuestionInput = (question: RiskAssessmentQuestion) => {
    switch (question.type) {
      case "text":
        return (
          <Input
            id={question.id}
            value={answers[question.id] || ""}
            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
            placeholder={question.guidance}
            className="w-full"
          />
        );

      case "textarea":
        return (
          <TextArea
            id={question.id}
            value={answers[question.id] || ""}
            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
            placeholder={question.guidance}
            rows={4}
            className="w-full"
          />
        );

      case "select":
        return (
          <select
            id={question.id}
            value={answers[question.id] || ""}
            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Select an option</option>
            {question.options?.map(
              (option: { value: string; label: string }) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ),
            )}
          </select>
        );

      case "radio":
        return question.options?.map(
          (option: { value: string; label: string; riskLevel?: unknown }) => (
            <div
              key={option.value}
              className={`p-3 border rounded-md cursor-pointer transition-colors ${
                answers[question.id] === parseInt(option.value)
                  ? "border-blue-500 bg-blue-50 dark:bg-blue-900/30 dark:border-blue-400"
                  : "border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
              }`}
              onClick={() => handleAnswerChange(question.id, option.value)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id={`${question.id}-${option.value}`}
                    name={question.id}
                    type="radio"
                    value={option.value}
                    checked={answers[question.id] === parseInt(option.value)}
                    onChange={() =>
                      handleAnswerChange(question.id, option.value)
                    }
                    className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label
                    htmlFor={`${question.id}-${option.value}`}
                    className="ml-3 block text-sm text-gray-700 dark:text-gray-300 cursor-pointer"
                  >
                    {option.label}
                  </label>
                </div>
                {option.riskLevel as any &&
                  getRiskLevelIndicator(parseInt(option.value))}
              </div>
            </div>
          ),
        );

      case "checkbox":
        return question.options?.map(
          (option: { value: string; label: string }) => (
            <div key={option.value} className="flex items-center">
              <input
                id={`${question.id}-${option.value}`}
                type="checkbox"
                value={option.value}
                checked={answers[question.id]
                  ?.toString()
                  .includes(option.value)}
                onChange={(e) => {
                  const currentValues =
                    answers[question.id]
                      ?.toString()
                      .split(",")
                      .filter(Boolean) || [];
                  if (e.target.checked) {
                    currentValues.push(option.value);
                  } else {
                    const index = currentValues.indexOf(option.value);
                    if (index > -1) currentValues.splice(index, 1);
                  }
                  handleAnswerChange(question.id, currentValues.join(","));
                }}
                className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500 rounded"
              />
              <label
                htmlFor={`${question.id}-${option.value}`}
                className="ml-3 block text-sm text-gray-700 dark:text-gray-300"
              >
                {option.label}
              </label>
            </div>
          ),
        );

      case "scale":
        return (
          <div className="space-y-2">
            <input
              type="range"
              id={question.id}
              min={question.minValue || 1}
              max={question.maxValue || 5}
              value={answers[question.id] || question.minValue || 1}
              onChange={(e) => handleAnswerChange(question.id, e.target.value)}
              className="w-full"
            />
            <div className="flex justify-between text-sm text-gray-600">
              {question.scaleLabels ? (
                Object.entries(question.scaleLabels).map(([value, label]) => (
                  <span key={value}>{String(label)}</span>
                ))
              ) : (
                <>
                  <span>{question.minValue || 1}</span>
                  <span>{question.maxValue || 5}</span>
                </>
              )}
            </div>
          </div>
        );

      default:
        return (
          <p className="text-gray-500">
            Unsupported question type: {question.type}
          </p>
        );
    }
  };

  // Calculate overall progress
  useEffect(() => {
    const totalQuestions = questions.length;
    const answeredQuestions = Object.keys(answers).length;
    const projectInfoComplete = projectName.trim() !== "" ? 1 : 0;

    // Calculate progress percentage (project info counts as one question)
    const calculatedProgress = Math.round(
      ((answeredQuestions + projectInfoComplete) / (totalQuestions + 1)) * 100,
    );
    setProgress(calculatedProgress);
  }, [answers, projectName, questions.length]);

  const validateStep = (step: number) => {
    const newErrors: Record<string, string> = {};

    if (step === 0) {
      if (!projectName.trim()) {
        newErrors.projectName = "Project name is required";
      }
      // Description and data controller are optional, so no validation needed
    } else {
      const category = categoryNames[step - 1];
      const categoryQuestions = categories[category];

      categoryQuestions.forEach((question) => {
        if (answers[question.id] === undefined) {
          newErrors[question.id] = "Please select an answer for this question";
        }
      });
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    setCurrentStep((prev) => prev - 1);
  };

  const handleSubmit = () => {
    if (validateStep(currentStep)) {
      // Submit with just the answers and project name as per interface definition
      onSubmit(answers, projectName);
    }
  };

  const renderStepContent = () => {
    if (currentStep === 0) {
      return (
        <div className="space-y-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Project Information
          </h3>

          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-md mb-6">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              This Data Protection Impact Assessment (DPIA) will help you
              identify and minimize data protection risks in your project.
              Please provide accurate information to receive the most relevant
              recommendations.
            </p>
          </div>

          <FormField
            id="projectName"
            label="Project Name"
            required
            error={errors.projectName}
          >
            <Input
              id="projectName"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              placeholder="Enter the name of your project or data processing activity"
            />
          </FormField>

          <FormField
            id="projectDescription"
            label="Project Description"
            description="Briefly describe the purpose and scope of your project"
          >
            <TextArea
              id="projectDescription"
              value={projectDescription}
              onChange={(e) => setProjectDescription(e.target.value)}
              rows={3}
              placeholder="Briefly describe the purpose and scope of your project"
            />
          </FormField>

          <FormField
            id="dataController"
            label="Data Controller"
            description="Organization responsible for the data"
          >
            <Input
              id="dataController"
              value={dataController}
              onChange={(e) => setDataController(e.target.value)}
              placeholder="Name of the organization responsible for the data"
            />
          </FormField>

          <FormField id="assessmentDate" label="Assessment Date">
            <Input
              type="date"
              id="assessmentDate"
              value={assessmentDate}
              onChange={(e) => setAssessmentDate(e.target.value)}
            />
          </FormField>
        </div>
      );
    }

    const category = categoryNames[currentStep - 1];
    const categoryQuestions = categories[category];

    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
            <span className="text-blue-600 dark:text-blue-300 font-medium">
              {currentStep}
            </span>
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            {category}
          </h3>
        </div>

        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-md mb-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {getCategoryDescription(category)}
          </p>
        </div>

        {categoryQuestions.map((question, index) => (
          <div
            key={question.id}
            className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg space-y-4"
          >
            <div className="flex items-start">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center mr-3 mt-0.5">
                <span className="text-blue-600 dark:text-blue-300 text-xs font-medium">
                  {index + 1}
                </span>
              </div>
              <label className="block text-sm font-medium text-gray-800 dark:text-gray-200">
                {question.text}
              </label>
            </div>

            <div className="ml-9 space-y-2">
              {renderQuestionInput(question)}
            </div>

            {errors[question.id] && (
              <p className="ml-9 text-sm text-red-600 dark:text-red-400">
                {errors[question.id]}
              </p>
            )}
          </div>
        ))}
      </div>
    );
  };

  // Helper function to get category descriptions
  const getCategoryDescription = (category: string): string => {
    switch (category) {
      case "Data Collection":
        return "These questions help assess the risks associated with the types of personal data you collect and the sources of that data.";
      case "Data Processing":
        return "These questions evaluate how you use, analyze, and transform the personal data within your project.";
      case "Data Sharing":
        return "These questions examine the risks of sharing personal data with third parties or transferring it across borders.";
      case "Security Measures":
        return "These questions assess the safeguards you have in place to protect personal data from unauthorized access or breaches.";
      case "Data Subject Rights":
        return "These questions evaluate how well your project supports individuals in exercising their rights over their personal data.";
      default:
        return "Please answer the following questions about your project.";
    }
  };

  // Helper function to display risk level indicators
  const getRiskLevelIndicator = (value: number) => {
    const variants: Record<
      number,
      "success" | "warning" | "danger" | "primary"
    > = {
      1: "success",
      2: "warning",
      3: "danger",
      4: "danger",
    };

    const labels = {
      1: "Low Risk",
      2: "Medium Risk",
      3: "High Risk",
      4: "Very High Risk",
    };

    return (
      <div className="flex items-center ml-auto pl-2">
        <Badge variant={variants[value as keyof typeof variants]}>
          {labels[value as keyof typeof labels]}
        </Badge>
      </div>
    );
  };

  const totalSteps = categoryNames.length + 1; // +1 for the project info step

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Data Protection Impact Assessment</CardTitle>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Assess the data protection risks of your project with our DPIA tool.
        </p>
      </CardHeader>

      <CardContent>
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Step {currentStep + 1} of {totalSteps}
            </div>
            <div className="text-sm font-medium text-gray-900 dark:text-white">
              {currentStep === 0
                ? "Project Information"
                : categoryNames[currentStep - 1]}
            </div>
          </div>
          <div className="h-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-2 bg-blue-600 rounded-full transition-all duration-300 ease-in-out"
              style={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }}
            />
          </div>
          <div className="flex justify-between mt-2">
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Overall completion: {progress}%
            </div>
            {currentStep > 0 && currentStep < totalSteps && (
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {
                  categories[categoryNames[currentStep - 1]].filter(
                    (q) => answers[q.id] !== undefined,
                  ).length
                }{" "}
                of {categories[categoryNames[currentStep - 1]].length} questions
                answered
              </div>
            )}
          </div>
        </div>

        <div className="mb-6">{renderStepContent()}</div>

        <div className="flex justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
          {currentStep > 0 ? (
            <Button type="button" onClick={handleBack} variant="outline">
              <svg
                className="w-5 h-5 mr-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              Back
            </Button>
          ) : (
            <div>{/* Empty div to maintain layout */}</div>
          )}

          {currentStep < totalSteps - 1 ? (
            <Button type="button" onClick={handleNext} variant="default">
              Next
              <svg
                className="w-5 h-5 ml-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </Button>
          ) : (
            <Button type="button" onClick={handleSubmit} variant="default">
              Submit Assessment
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
