"use client";

import { useState } from "react";
import { ConsentOption } from "@/types";
import { Button } from "@/components/ui/Button";
import { Checkbox } from "@/components/ui/Checkbox";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

interface ConsentBannerProps {
  title?: string;
  description?: string;
  privacyPolicyUrl?: string;
  options: ConsentOption[];
  onSave: (consents: Record<string, boolean>) => void;
  onClose?: () => void;
  className?: string;
}

export default function ConsentBanner({
  title = "Privacy Preferences",
  description = "We use cookies and similar technologies to provide certain features, enhance the user experience and deliver content that is relevant to your interests.",
  privacyPolicyUrl = "/privacy-policy",
  options,
  onSave,
  className = "",
}: ConsentBannerProps) {
  const [consents, setConsents] = useState<Record<string, boolean>>(
    options.reduce(
      (acc, option) => {
        acc[option.id] = option.defaultValue ?? false;
        return acc;
      },
      {} as Record<string, boolean>,
    ),
  );

  const handleToggle = (id: string) => {
    const option = options.find((opt) => opt.id === id);
    if (option?.required) return;

    setConsents((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleAcceptAll = () => {
    const allConsents = options.reduce(
      (acc, option) => {
        acc[option.id] = true;
        return acc;
      },
      {} as Record<string, boolean>,
    );

    setConsents(allConsents);
    onSave(allConsents);
  };

  const handleSave = () => {
    onSave(consents);
  };

  const handleRejectAll = () => {
    const rejectedConsents = options.reduce(
      (acc, option) => {
        acc[option.id] = option.required ? true : false;
        return acc;
      },
      {} as Record<string, boolean>,
    );

    setConsents(rejectedConsents);
    onSave(rejectedConsents);
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/50 ${className}`}
    >
      <Card className="w-full max-w-3xl max-h-[90vh] overflow-auto shadow-xl animate-in fade-in slide-in-from-bottom-5 duration-300">
        <CardHeader className="border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl">{title}</CardTitle>
              <CardDescription className="mt-2">{description}</CardDescription>
            </div>
            <Badge variant="primary" className="hidden sm:flex">
              Privacy Settings
            </Badge>
          </div>
          <a
            href={privacyPolicyUrl}
            className="text-sm text-blue-600 dark:text-blue-400 hover:underline mt-2 inline-flex items-center"
          >
            <svg
              className="w-4 h-4 mr-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
              />
            </svg>
            View our Privacy Policy
          </a>
        </CardHeader>

        <CardContent className="space-y-4 p-6">
          <div className="grid gap-4">
            {options.map((option) => (
              <div
                key={option.id}
                className={`p-4 rounded-lg border ${consents[option.id] ? "border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20" : "border-gray-200 dark:border-gray-700"} transition-colors duration-200`}
              >
                <div className="flex items-start">
                  <div className="flex-1">
                    <div className="flex items-center">
                      <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                        {option.label}
                      </h3>
                      {option.required && (
                        <Badge variant="secondary" className="ml-2 text-xs">
                          Required
                        </Badge>
                      )}
                    </div>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      {option.description}
                    </p>
                  </div>
                  <div className="ml-3 flex h-5 items-center">
                    <Checkbox
                      id={`consent-${option.id}`}
                      checked={consents[option.id]}
                      onChange={() => handleToggle(option.id)}
                      disabled={option.required}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>

        <CardFooter className="flex flex-col sm:flex-row sm:justify-between border-t border-gray-200 dark:border-gray-700 p-6 bg-gray-50 dark:bg-gray-800">
          <div className="mb-4 sm:mb-0">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              You can change your preferences at any time by visiting your
              account settings.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
            <Button
              variant="outline"
              onClick={handleRejectAll}
              className="sm:order-1"
            >
              Reject All
            </Button>
            <Button
              variant="secondary"
              onClick={handleSave}
              className="sm:order-2"
            >
              Save Preferences
            </Button>
            <Button
              variant="default"
              onClick={handleAcceptAll}
              className="sm:order-3"
            >
              Accept All
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
