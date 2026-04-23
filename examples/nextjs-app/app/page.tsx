"use client";

import {
  NDPRComplianceDashboard,
} from "@tantainnovative/ndpr-toolkit/presets";
import type { ComplianceInput } from "@tantainnovative/ndpr-toolkit";

const complianceData: ComplianceInput = {
  consent: {
    hasConsentMechanism: true,
    hasPurposeSpecification: true,
    hasWithdrawalMechanism: true,
    hasMinorProtection: false,
    consentRecordsRetained: true,
  },
  dsr: {
    hasRequestMechanism: true,
    supportsAccess: true,
    supportsRectification: true,
    supportsErasure: true,
    supportsPortability: true,
    supportsObjection: false,
    responseTimelineDays: 14,
  },
  dpia: {
    conductedForHighRisk: true,
    documentedRisks: true,
    mitigationMeasures: false,
  },
  breach: {
    hasNotificationProcess: true,
    notifiesWithin72Hours: true,
    hasRiskAssessment: true,
    hasRecordKeeping: false,
  },
  policy: {
    hasPrivacyPolicy: true,
    isPubliclyAccessible: true,
    lastUpdated: "2025-01-15",
    coversAllSections: true,
  },
  lawfulBasis: {
    documentedForAllProcessing: true,
    hasLegitimateInterestAssessment: false,
  },
  crossBorder: {
    hasTransferMechanisms: true,
    adequacyAssessed: true,
    ndpcApprovalObtained: false,
  },
  ropa: {
    maintained: true,
    includesAllProcessing: true,
    lastReviewed: "2025-02-01",
  },
};

export default function HomePage() {
  return (
    <div>
      <h1>NDPA Compliance Dashboard</h1>
      <p>
        This dashboard shows your organisation&apos;s compliance status under
        the Nigeria Data Protection Act (NDPA) 2023.
      </p>

      <NDPRComplianceDashboard input={complianceData} />
    </div>
  );
}
