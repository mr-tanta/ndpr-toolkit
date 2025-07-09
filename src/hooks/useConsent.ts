"use client";

import { useState, useEffect } from "react";
import { ConsentRecord } from "@/types";
import consentService from "@/lib/consentService";

export function useConsent() {
  const [consentRecord, setConsentRecord] = useState<ConsentRecord | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(true);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // Load consent from storage on component mount
    const storedConsent = consentService.getCurrentConsent();
    setConsentRecord(storedConsent);
    setIsLoading(false);

    // If no consent is stored, show the banner
    if (!storedConsent) {
      setShowBanner(true);
    }
  }, []);

  const saveConsent = (consents: Record<string, boolean>, userId?: string) => {
    const newRecord = consentService.saveConsent(consents, userId);
    setConsentRecord(newRecord);
    setShowBanner(false);
    return newRecord;
  };

  const updateConsent = (
    consents: Record<string, boolean>,
    changeReason?: string,
    userId?: string,
  ) => {
    const updatedRecord = consentService.updateConsent(
      consents,
      changeReason,
      userId,
    );
    setConsentRecord(updatedRecord);
    return updatedRecord;
  };

  const hasConsent = (type: string): boolean => {
    if (!consentRecord) return false;
    return consentRecord.consents[type] === true;
  };

  const openPreferences = () => {
    setShowBanner(true);
  };

  const closePreferences = () => {
    setShowBanner(false);
  };

  return {
    consentRecord,
    isLoading,
    showBanner,
    saveConsent,
    updateConsent,
    hasConsent,
    openPreferences,
    closePreferences,
  };
}
