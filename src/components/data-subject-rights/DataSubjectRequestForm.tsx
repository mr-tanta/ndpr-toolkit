"use client";

import { useState, useEffect } from "react";
import { RequestType } from "@/types";
import { Input } from "@/components/ui/Input";
import { TextArea } from "@/components/ui/TextArea";
import { Button } from "@/components/ui/Button";
import { FormField } from "@/components/ui/FormField";
import { Checkbox } from "@/components/ui/Checkbox";
import { LoadingButton } from "@/components/ui/Loading";
import { cn } from "@/lib/utils";

// Helper function to get icons for request types
const getRequestTypeIcon = (requestType: RequestType) => {
  switch (requestType) {
    case "access":
      return (
        <svg
          className="w-5 h-5"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
          <path
            fillRule="evenodd"
            d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
            clipRule="evenodd"
          />
        </svg>
      );
    case "rectification":
      return (
        <svg
          className="w-5 h-5"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
        </svg>
      );
    case "erasure":
      return (
        <svg
          className="w-5 h-5"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
            clipRule="evenodd"
          />
        </svg>
      );
    case "restriction":
      return (
        <svg
          className="w-5 h-5"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
            clipRule="evenodd"
          />
        </svg>
      );
    case "portability":
      return (
        <svg
          className="w-5 h-5"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path d="M4 3a2 2 0 100 4h12a2 2 0 100-4H4z" />
          <path
            fillRule="evenodd"
            d="M3 8h14v7a2 2 0 01-2 2H5a2 2 0 01-2-2V8zm5 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z"
            clipRule="evenodd"
          />
        </svg>
      );
    case "objection":
      return (
        <svg
          className="w-5 h-5"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
            clipRule="evenodd"
          />
        </svg>
      );
    default:
      return (
        <svg
          className="w-5 h-5"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z"
            clipRule="evenodd"
          />
        </svg>
      );
  }
};

interface DataSubjectRequestFormProps {
  onSubmit: (data: {
    requestType: RequestType;
    name: string;
    email: string;
    details: string;
    consent: boolean;
  }) => void;
  className?: string;
}

export default function DataSubjectRequestForm({
  onSubmit,
  className = "",
}: DataSubjectRequestFormProps) {
  const [formData, setFormData] = useState({
    requestType: "access" as RequestType,
    name: "",
    email: "",
    details: "",
    consent: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const requestTypeOptions: {
    value: RequestType;
    label: string;
    description: string;
  }[] = [
    {
      value: "access",
      label: "Access to Personal Data",
      description: "Request a copy of your personal data that we process",
    },
    {
      value: "rectification",
      label: "Rectification of Data",
      description: "Request correction of inaccurate personal data",
    },
    {
      value: "erasure",
      label: "Erasure of Data",
      description:
        'Request deletion of your personal data ("right to be forgotten")',
    },
    {
      value: "restriction",
      label: "Restriction of Processing",
      description: "Request to restrict how we process your data",
    },
    {
      value: "portability",
      label: "Data Portability",
      description:
        "Request to receive your data in a structured, machine-readable format",
    },
    {
      value: "objection",
      label: "Object to Processing",
      description: "Object to processing of your personal data",
    },
  ];

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when field is edited
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.details.trim()) {
      newErrors.details = "Please provide details about your request";
    }

    if (!formData.consent) {
      newErrors.consent =
        "You must consent to the processing of your data to submit this request";
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
        requestType: formData.requestType,
        name: formData.name,
        email: formData.email,
        details: formData.details,
        consent: formData.consent,
      });

      // Reset form after successful submission
      setFormData({
        requestType: "access",
        name: "",
        email: "",
        details: "",
        consent: false,
      });
    } catch (error) {
      console.error("Error submitting request:", error);
      setErrors({
        submit:
          "An error occurred while submitting your request. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Track form completion percentage for progress indicator
  const [completionPercentage, setCompletionPercentage] = useState(0);

  // Calculate form completion percentage
  useEffect(() => {
    let filledFields = 0;
    const totalFields = 3; // name, email, details

    if (formData.name.trim()) filledFields++;
    if (formData.email.trim()) filledFields++;
    if (formData.details.trim()) filledFields++;

    setCompletionPercentage(Math.round((filledFields / totalFields) * 100));
  }, [formData]);

  return (
    <div
      className={`bg-white dark:bg-gray-800 shadow-lg rounded-lg overflow-hidden ${className}`}
    >
      {/* Header with progress indicator */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-white relative">
        <h2 className="text-xl font-bold mb-2">
          Submit a Data Subject Request
        </h2>
        <p className="text-blue-100 text-sm mb-4">
          Exercise your rights under the Nigeria Data Protection Regulation
        </p>

        {/* Progress bar */}
        <div className="w-full h-2 bg-blue-800 rounded-full overflow-hidden mt-2">
          <div
            className="h-full bg-green-400 transition-all duration-300 ease-out"
            style={{ width: `${completionPercentage}%` }}
          ></div>
        </div>
        <div className="flex justify-between text-xs text-blue-200 mt-1">
          <span>Form Progress</span>
          <span>{completionPercentage}% Complete</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {/* Request Type Selection with Icons */}
        <div className="mb-8">
          <label
            htmlFor="requestType"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
          >
            Request Type
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-3">
            {requestTypeOptions.map((option) => (
              <div
                key={option.value}
                onClick={() =>
                  setFormData({ ...formData, requestType: option.value })
                }
                className={cn(
                  "cursor-pointer border rounded-lg p-3 transition-all",
                  formData.requestType === option.value
                    ? "bg-blue-50 border-blue-500 dark:bg-blue-900/30 dark:border-blue-400"
                    : "border-gray-200 hover:border-gray-300 dark:border-gray-700 dark:hover:border-gray-600",
                )}
              >
                <div className="flex flex-col items-center text-center">
                  <div
                    className={cn(
                      "w-10 h-10 flex items-center justify-center rounded-full mb-2",
                      formData.requestType === option.value
                        ? "bg-blue-100 text-blue-600 dark:bg-blue-800 dark:text-blue-300"
                        : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
                    )}
                  >
                    {getRequestTypeIcon(option.value)}
                  </div>
                  <span className="text-sm font-medium">{option.label}</span>
                </div>
              </div>
            ))}
          </div>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/50 p-3 rounded-lg border border-gray-100 dark:border-gray-700">
            <span className="font-medium block mb-1">About this request:</span>
            {
              requestTypeOptions.find(
                (option) => option.value === formData.requestType,
              )?.description
            }
          </p>
        </div>

        {/* Personal Information Section */}
        <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg border border-gray-100 dark:border-gray-700 mb-6">
          <h3 className="text-md font-medium text-gray-900 dark:text-white mb-4">
            Personal Information
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <FormField id="name" label="Full Name" required error={errors.name}>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg
                    className="h-5 w-5 text-gray-400"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={cn(
                    "pl-10",
                    errors.name &&
                      "border-red-300 focus:border-red-500 focus:ring-red-500",
                  )}
                />
              </div>
            </FormField>

            <FormField
              id="email"
              label="Email Address"
              required
              error={errors.email}
            >
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg
                    className="h-5 w-5 text-gray-400"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                  </svg>
                </div>
                <Input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={cn(
                    "pl-10",
                    errors.email &&
                      "border-red-300 focus:border-red-500 focus:ring-red-500",
                  )}
                />
              </div>
            </FormField>
          </div>
        </div>

        {/* Request Details Section */}
        <FormField
          id="details"
          label="Request Details"
          required
          error={errors.details}
          description="Your request will be processed in accordance with the Nigeria Data Protection Regulation (NDPR) and Data Protection Act (DPA)."
        >
          <div className="relative">
            <TextArea
              id="details"
              name="details"
              rows={5}
              value={formData.details}
              onChange={handleChange}
              className={cn(
                errors.details &&
                  "border-red-300 focus:border-red-500 focus:ring-red-500",
              )}
              placeholder="Please provide specific details about your request. For example, what personal data you would like to access, what corrections you need to make, etc."
            />
            <div className="absolute bottom-2 right-2 text-xs text-gray-400">
              {formData.details.length} characters
            </div>
          </div>
        </FormField>

        {/* Consent Checkbox */}
        <div className="mt-4">
          <Checkbox
            id="consent"
            name="consent"
            checked={formData.consent}
            onChange={(e) =>
              setFormData({ ...formData, consent: e.target.checked })
            }
            label="I consent to the processing of my personal data"
            description="By submitting this form, you consent to our processing of your personal data for the purpose of handling your request."
          />
          {errors.consent && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
              {errors.consent}
            </p>
          )}
        </div>

        {errors.submit && (
          <div className="rounded-md bg-red-50 dark:bg-red-900/20 p-4 flex items-start">
            <svg
              className="h-5 w-5 text-red-400 mt-0.5 mr-2"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
            <p className="text-sm text-red-700 dark:text-red-400">
              {errors.submit}
            </p>
          </div>
        )}

        <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
          <Button
            type="button"
            variant="secondary"
            onClick={() => {
              setFormData({
                requestType: "access",
                name: "",
                email: "",
                details: "",
                consent: false,
              });
              setErrors({});
            }}
            className="mr-3"
          >
            Reset Form
          </Button>
          <LoadingButton
            type="submit"
            loading={isSubmitting}
            loadingText="Processing..."
            className="px-6 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-md font-medium"
          >
            Submit Request
          </LoadingButton>
        </div>
      </form>
    </div>
  );
}
