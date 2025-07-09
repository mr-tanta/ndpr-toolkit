"use client";

import { ConsentRecord, ConsentHistoryEntry } from "@/types";
import { v4 as uuidv4 } from "uuid";
import { storage } from "./storage";

// In a real implementation, this would connect to a database
// For demo purposes, we're using localStorage

const CONSENT_STORAGE_KEY = "ndpr_consent_records";
const CONSENT_HISTORY_KEY = "ndpr_consent_history";

// Helper function to get consent history
const getConsentHistoryHelper = (): ConsentHistoryEntry[] => {
  return storage.getItem<ConsentHistoryEntry[]>(CONSENT_HISTORY_KEY, []) || [];
};

export const consentService = {
  // Save a new consent record
  saveConsent: (
    consents: Record<string, boolean>,
    userId?: string,
  ): ConsentRecord => {
    const consentRecord: ConsentRecord = {
      id: uuidv4(),
      userId,
      consents,
      timestamp: new Date(),
      ipAddress: "Collected server-side in real implementation",
      userAgent:
        typeof window !== "undefined" ? window.navigator.userAgent : "Unknown",
      version: "1.0",
    };

    // Store in localStorage for demo
    // Save as current consent
    if (!storage.setItem(CONSENT_STORAGE_KEY, consentRecord)) {
      throw new Error("Failed to save consent record");
    }

    // Add to history
    const historyEntry: ConsentHistoryEntry = {
      timestamp: new Date(),
      consents,
      action: "granted",
      ipAddress: "Collected server-side in real implementation",
      userAgent:
        typeof window !== "undefined" ? window.navigator.userAgent : "Unknown",
      version: "1.0",
    };

    const history = getConsentHistoryHelper();
    history.push(historyEntry);
    if (!storage.setItem(CONSENT_HISTORY_KEY, history)) {
      throw new Error("Failed to save consent history");
    }

    return consentRecord;
  },

  // Get the current consent record
  getCurrentConsent: (): ConsentRecord | null => {
    return storage.getItem<ConsentRecord>(CONSENT_STORAGE_KEY);
  },

  // Get consent history
  getConsentHistory: (): ConsentHistoryEntry[] => {
    return getConsentHistoryHelper();
  },

  // Update consent with change reason
  updateConsent: (
    consents: Record<string, boolean>,
    changeReason?: string,
    userId?: string,
  ): ConsentRecord => {
    // Get the previous consent to determine the action
    const previousConsent = consentService.getCurrentConsent();

    // Create the new consent record
    const consentRecord: ConsentRecord = {
      id: uuidv4(),
      userId,
      consents,
      timestamp: new Date(),
      ipAddress: "Collected server-side in real implementation",
      userAgent:
        typeof window !== "undefined" ? window.navigator.userAgent : "Unknown",
      version: "1.0",
    };

    // Store in localStorage for demo
    // Save as current consent
    if (!storage.setItem(CONSENT_STORAGE_KEY, consentRecord)) {
      throw new Error("Failed to save consent record");
    }

    // Determine the action type
    let action: "granted" | "revoked" | "updated" = "updated";
    if (!previousConsent) {
      action = "granted";
    } else {
      const allRevoked = Object.values(consents).every((v) => !v);
      if (allRevoked) {
        action = "revoked";
      }
    }

    // Add to history
    const historyEntry: ConsentHistoryEntry = {
      timestamp: new Date(),
      consents,
      action,
      ipAddress: "Collected server-side in real implementation",
      userAgent:
        typeof window !== "undefined" ? window.navigator.userAgent : "Unknown",
      version: "1.0",
    };

    const history = getConsentHistoryHelper();
    history.push(historyEntry);
    if (!storage.setItem(CONSENT_HISTORY_KEY, history)) {
      throw new Error("Failed to save consent history");
    }

    return consentRecord;
  },

  // Clear all consent data (for testing/development)
  clearConsentData: (): boolean => {
    const clearedCurrent = storage.removeItem(CONSENT_STORAGE_KEY);
    const clearedHistory = storage.removeItem(CONSENT_HISTORY_KEY);
    return clearedCurrent && clearedHistory;
  },

  // Check if a specific consent is granted
  hasConsent: (type: string): boolean => {
    const current = consentService.getCurrentConsent();
    if (!current) return false;
    return current.consents[type] === true;
  },
};

export default consentService;
