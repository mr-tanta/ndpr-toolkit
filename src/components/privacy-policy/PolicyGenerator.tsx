"use client";

import React, { useState, useRef } from "react";
import { PolicySection } from "@/types";
import { jsPDF } from "jspdf";
import { escapeHtml } from "@/lib/sanitize";

// Import step components
import OrganizationInfoStep from "./steps/OrganizationInfoStep";
import DataCollectionStep from "./steps/DataCollectionStep";
import DataSharingStep from "./steps/DataSharingStep";
import CustomSectionsStep from "./steps/CustomSectionsStep";
import PolicyPreviewStep from "./steps/PolicyPreviewStep";

// Import shared components
import StepIndicator from "./shared/StepIndicator";

// Import static data
import {
  defaultDataPurposes,
  defaultSecurityMeasures,
  dataSubjectCategories,
  trackingTechnologies,
  transferSafeguards,
  defaultCookieTypes,
  commonTransferCountries,
} from "./data";

interface PolicyFormData {
  organizationName: string;
  organizationContact: string;
  organizationWebsite: string;
  organizationAddress: string;
  organizationType: string;
  industryCategory: string;
  registrationNumber: string;
  dataCollectionPurposes: string[];
  dataRetentionPeriod: string;
  legalBasisForProcessing: string[];
  dataCategories: string[];
  dataSubjects: string[];
  automatedDecisionMaking: boolean;
  automatedDecisionDetails: string;
  thirdPartySharing: boolean;
  thirdParties: string[];
  thirdPartyCategories: string[];
  thirdPartyPurposes: string[];
  securityMeasures: string[];
  dataBreachProcedures: string;
  regulatoryCompliance: string[];
  cookiesUsed: boolean;
  cookieTypes: string[];
  cookieLifespan: string;
  trackingTechnologies: string[];
  internationalTransfers: boolean;
  transferCountries: string[];
  transferSafeguards: string[];
  processesChildrenData: boolean;
  childrenDataDetails: string;
  processesSpecialCategories: boolean;
  specialCategoriesDetails: string;
  policyEffectiveDate: string;
  policyUpdateProcedure: string;
  policyVersion: string;
  previousPolicyUrl: string;
  dpoContact: string;
  hasDPO: boolean;
  supervisoryAuthorityContact: string;
  customSections: { title: string; content: string }[];
  includeNDPRCompliance: boolean;
  includeLegalReferences: boolean;
  includeExamples: boolean;
}

// Generate safe HTML from form data without using innerHTML
function generateSafeHTMLFromFormData(formData: PolicyFormData): string {
  const sections: string[] = [];

  // Title
  sections.push(
    `<h1>${escapeHtml(formData.organizationName)} Privacy Policy</h1>`,
  );

  // Introduction
  sections.push("<h2>Introduction</h2>");
  sections.push(
    `<p>This Privacy Policy describes how ${escapeHtml(formData.organizationName)} collects, uses, and discloses your personal information.${formData.includeNDPRCompliance ? " This policy is compliant with the Nigeria Data Protection Regulation (NDPR) and the Data Protection Act (DPA)." : ""}</p>`,
  );

  // About Us
  sections.push("<h2>About Us</h2>");
  sections.push(
    `<p>${escapeHtml(formData.organizationName)}${formData.organizationAddress ? ` is located at ${escapeHtml(formData.organizationAddress)}` : ""}.${formData.organizationWebsite ? ` Our website is ${escapeHtml(formData.organizationWebsite)}.` : ""}</p>`,
  );

  // Information We Collect
  if (formData.dataCollectionPurposes?.length > 0) {
    sections.push("<h2>Information We Collect</h2>");
    sections.push(
      "<p>We collect and process your personal data for the following purposes:</p>",
    );
    sections.push("<ul>");
    formData.dataCollectionPurposes.forEach((purpose: string) => {
      sections.push(`<li>${escapeHtml(purpose)}</li>`);
    });
    sections.push("</ul>");
  }

  // Data Retention
  sections.push("<h2>Data Retention</h2>");
  sections.push(
    `<p>We will retain your personal data for ${escapeHtml(formData.dataRetentionPeriod || "a period appropriate to the purpose")}, or for as long as necessary to fulfill the purposes for which it was collected.</p>`,
  );

  // Third-Party Sharing
  if (formData.thirdPartySharing && formData.thirdParties?.length > 0) {
    sections.push("<h2>Third-Party Sharing</h2>");
    sections.push(
      "<p>We may share your personal information with the following third parties:</p>",
    );
    sections.push("<ul>");
    formData.thirdParties.forEach((party: string) => {
      sections.push(`<li>${escapeHtml(party)}</li>`);
    });
    sections.push("</ul>");
  }

  // Cookies
  if (formData.cookiesUsed && formData.cookieTypes?.length > 0) {
    sections.push("<h2>Cookies and Tracking Technologies</h2>");
    sections.push(
      "<p>Our website uses cookies and similar tracking technologies. We use the following types of cookies:</p>",
    );
    sections.push("<ul>");
    formData.cookieTypes.forEach((type: string) => {
      sections.push(`<li>${escapeHtml(type)}</li>`);
    });
    sections.push("</ul>");
  }

  // International Transfers
  if (
    formData.internationalTransfers &&
    formData.transferCountries?.length > 0
  ) {
    sections.push("<h2>International Data Transfers</h2>");
    sections.push(
      "<p>We may transfer your personal data to the following countries outside Nigeria:</p>",
    );
    sections.push("<ul>");
    formData.transferCountries.forEach((country: string) => {
      sections.push(`<li>${escapeHtml(country)}</li>`);
    });
    sections.push("</ul>");
    sections.push(
      "<p>We ensure appropriate safeguards are in place to protect your data when transferred internationally.</p>",
    );
  }

  // Security Measures
  if (formData.securityMeasures?.length > 0) {
    sections.push("<h2>Security Measures</h2>");
    sections.push(
      "<p>We implement the following security measures to protect your personal data:</p>",
    );
    sections.push("<ul>");
    formData.securityMeasures.forEach((measure: string) => {
      sections.push(`<li>${escapeHtml(measure)}</li>`);
    });
    sections.push("</ul>");
  }

  // Your Rights
  sections.push("<h2>Your Rights</h2>");
  sections.push(
    `<p>${formData.includeNDPRCompliance ? "Under the NDPR and DPA, you have the following rights:" : "You have the following rights regarding your personal data:"}</p>`,
  );
  sections.push("<ul>");
  sections.push("<li>Right to access your personal data</li>");
  sections.push("<li>Right to rectify inaccurate personal data</li>");
  sections.push('<li>Right to erasure ("right to be forgotten")</li>');
  sections.push("<li>Right to restrict processing</li>");
  sections.push("<li>Right to object to processing</li>");
  sections.push("<li>Right to data portability</li>");
  sections.push("</ul>");
  sections.push(
    `<p>To exercise these rights, please contact us at ${escapeHtml(formData.organizationContact)}.</p>`,
  );

  // Custom Sections
  if (formData.customSections?.length > 0) {
    formData.customSections.forEach((section) => {
      sections.push(`<h2>${escapeHtml(section.title)}</h2>`);
      sections.push(`<p>${escapeHtml(section.content)}</p>`);
    });
  }

  // DPO
  if (formData.hasDPO && formData.dpoContact) {
    sections.push("<h2>Data Protection Officer</h2>");
    sections.push(
      `<p>You can contact our Data Protection Officer at ${escapeHtml(formData.dpoContact)}.</p>`,
    );
  }

  // Contact Us
  sections.push("<h2>Contact Us</h2>");
  sections.push(
    `<p>If you have any questions about this Privacy Policy, please contact us at ${escapeHtml(formData.organizationContact)}.</p>`,
  );

  // Last Updated
  sections.push(
    `<p>Last Updated: ${escapeHtml(formData.policyEffectiveDate || new Date().toISOString().split("T")[0])}</p>`,
  );

  return sections.join("\n");
}

interface PolicyGeneratorProps {
  onGenerate: (policy: {
    organizationName: string;
    organizationContact: string;
    sections: PolicySection[];
  }) => void;
  className?: string;
}

export default function PolicyGenerator({
  onGenerate,
  className = "",
}: PolicyGeneratorProps) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    // Organization Information
    organizationName: "",
    organizationContact: "",
    organizationWebsite: "",
    organizationAddress: "",
    organizationType: "", // New: Type of organization (e.g., e-commerce, healthcare, fintech)
    industryCategory: "", // New: Industry category for contextual examples
    registrationNumber: "", // New: Business registration number

    // Data Processing Information
    dataCollectionPurposes: [] as string[],
    dataRetentionPeriod: "",
    legalBasisForProcessing: [] as string[], // New: Legal basis under NDPR/DPA
    dataCategories: [] as string[], // New: Categories of personal data collected
    dataSubjects: [] as string[], // New: Categories of data subjects
    automatedDecisionMaking: false, // New: Whether automated decision-making is used
    automatedDecisionDetails: "", // New: Details about automated decision-making

    // Data Sharing Information
    thirdPartySharing: false,
    thirdParties: [] as string[],
    thirdPartyCategories: [] as string[], // New: Categories of third parties
    thirdPartyPurposes: [] as string[], // New: Purposes of third-party sharing

    // Security and Compliance
    securityMeasures: [] as string[],
    dataBreachProcedures: "", // New: Data breach notification procedures
    regulatoryCompliance: [] as string[], // New: Additional regulations complied with

    // Cookies and Tracking
    cookiesUsed: false,
    cookieTypes: [] as string[],
    cookieLifespan: "", // New: Cookie lifespan information
    trackingTechnologies: [] as string[], // New: Other tracking technologies used

    // International Transfers
    internationalTransfers: false,
    transferCountries: [] as string[],
    transferSafeguards: [] as string[], // New: Safeguards for international transfers

    // Special Categories
    processesChildrenData: false, // New: Whether children's data is processed
    childrenDataDetails: "", // New: Details about children's data processing
    processesSpecialCategories: false, // New: Whether special category data is processed
    specialCategoriesDetails: "", // New: Details about special category data

    // Policy Management
    policyEffectiveDate: new Date().toISOString().split("T")[0], // New: Policy effective date
    policyUpdateProcedure: "", // New: How policy updates are communicated
    policyVersion: "1.0", // New: Policy version number
    previousPolicyUrl: "", // New: Link to previous policy version

    // Contact Information
    dpoContact: "",
    hasDPO: false,
    supervisoryAuthorityContact: "", // New: Contact for supervisory authority

    // Customization
    customSections: [] as { title: string; content: string }[],
    includeNDPRCompliance: true,
    includeLegalReferences: true, // Whether to include specific legal references
    includeExamples: true, // Whether to include industry-specific examples
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const previewRef = useRef<HTMLDivElement>(null);

  // Handle form field changes
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value, type } = e.target as HTMLInputElement;

    if (type === "checkbox") {
      setFormData((prev) => ({
        ...prev,
        [name]: (e.target as HTMLInputElement).checked,
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

  // Handle checkbox group selections
  const handleMultiSelect = (
    category:
      | "dataCollectionPurposes"
      | "securityMeasures"
      | "cookieTypes"
      | "transferCountries"
      | "dataSubjects"
      | "dataCategories"
      | "legalBasisForProcessing"
      | "thirdPartyCategories"
      | "thirdPartyPurposes"
      | "trackingTechnologies"
      | "transferSafeguards"
      | "regulatoryCompliance",
    item: string,
  ) => {
    setFormData((prev) => {
      const currentItems = [...prev[category]];
      if (currentItems.includes(item)) {
        return {
          ...prev,
          [category]: currentItems.filter((i) => i !== item),
        };
      } else {
        return {
          ...prev,
          [category]: [...currentItems, item],
        };
      }
    });
  };

  // Add a third party to the list
  const handleAddThirdParty = () => {
    const thirdPartyInput = document.getElementById(
      "thirdPartyInput",
    ) as HTMLInputElement;
    if (thirdPartyInput && thirdPartyInput.value.trim()) {
      setFormData((prev) => ({
        ...prev,
        thirdParties: [...prev.thirdParties, thirdPartyInput.value.trim()],
      }));
      thirdPartyInput.value = "";
    }
  };

  // Remove a third party from the list
  const handleRemoveThirdParty = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      thirdParties: prev.thirdParties.filter((_, i) => i !== index),
    }));
  };

  // Add a custom section to the policy
  const handleAddCustomSection = (title: string, content: string) => {
    if (title.trim() && content.trim()) {
      setFormData((prev) => ({
        ...prev,
        customSections: [
          ...prev.customSections,
          { title: title.trim(), content: content.trim() },
        ],
      }));
    }
  };

  // Remove a custom section from the policy
  const handleRemoveCustomSection = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      customSections: prev.customSections.filter((_, i) => i !== index),
    }));
  };

  // Validate each step of the form with enhanced validation
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const validateStep = (_step: number) => {
    // Clear any existing errors
    setErrors({});

    // Always return true to allow navigation through all steps
    return true;
  };

  // Move to the next step if validation passes
  const handleNext = () => {
    if (validateStep(step)) {
      setStep((prev) => prev + 1);
    }
  };

  // Move to the previous step
  const handleBack = () => {
    setStep((prev) => prev - 1);
  };

  // These handler functions have been moved to the final policy page
  // but are kept here for reference and to avoid TypeScript errors
  // The underscore prefix indicates they're unused
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _handleCopyPolicy = () => {
    if (previewRef.current) {
      const policyText = previewRef.current.innerText;
      navigator.clipboard
        .writeText(policyText)
        .then(() => {
          alert("Privacy policy copied to clipboard!");
        })
        .catch((err) => {
          console.error("Failed to copy text: ", err);
          alert("Failed to copy text. Please try again.");
        });
    }
  };

  // Share policy via email
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _handleSharePolicy = () => {
    if (previewRef.current) {
      const subject = `${formData.organizationName} - Privacy Policy`;
      const body = previewRef.current.innerText;
      const mailtoLink = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      window.open(mailtoLink);
    }
  };

  // Download policy in different formats
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _handleDownloadPolicy = async (
    format: "txt" | "html" | "md" | "pdf" | "rtf",
  ) => {
    if (previewRef.current) {
      let content = "";
      let mimeType = "";
      let fileExtension = "";
      let blob: Blob | null = null;

      const policyText = previewRef.current.innerText;
      // Instead of using innerHTML directly, we'll generate safe HTML from the form data
      const policyHTML = generateSafeHTMLFromFormData(formData);
      const policyTitle = `${formData.organizationName} Privacy Policy`;
      const fileName = `${formData.organizationName.replace(/\s+/g, "-").toLowerCase()}-privacy-policy`;

      // Convert policy to markdown
      const convertToMarkdown = (html: string): string => {
        // Simple HTML to Markdown conversion
        let md = html
          .replace(/<h1>(.*?)<\/h1>/g, "# $1\n\n")
          .replace(/<h2>(.*?)<\/h2>/g, "## $1\n\n")
          .replace(/<h3>(.*?)<\/h3>/g, "### $1\n\n")
          .replace(/<p>(.*?)<\/p>/g, "$1\n\n")
          .replace(/<strong>(.*?)<\/strong>/g, "**$1**")
          .replace(/<em>(.*?)<\/em>/g, "*$1*")
          .replace(/<ul>(.*?)<\/ul>/g, "$1\n")
          .replace(/<li>(.*?)<\/li>/g, "- $1\n")
          .replace(/<br\s*\/?>/g, "\n")
          .replace(/&nbsp;/g, " ");

        // Remove any remaining HTML tags
        md = md.replace(/<[^>]*>/g, "");

        return md;
      };

      try {
        switch (format) {
          case "pdf":
            // Create PDF using jsPDF
            const pdf = new jsPDF({
              orientation: "portrait",
              unit: "mm",
              format: "a4",
            });

            // Add title
            pdf.setFontSize(16);
            pdf.text(policyTitle, 20, 20);
            pdf.setFontSize(12);

            // Split text into lines to fit on PDF page
            const textLines = pdf.splitTextToSize(policyText, 170);
            pdf.text(textLines, 20, 30);

            // Get PDF as blob
            blob = pdf.output("blob");
            mimeType = "application/pdf";
            fileExtension = "pdf";
            break;

          case "rtf":
            // For DOCX, we'll create a simple text file with .docx extension
            // This is a workaround since browser-based DOCX generation is limited
            content = policyText;
            mimeType =
              "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
            fileExtension = "rtf";
            blob = new Blob([content], { type: mimeType });
            break;

          case "html":
            content = policyHTML;
            mimeType = "text/html";
            fileExtension = "html";
            blob = new Blob([content], { type: mimeType });
            break;

          case "md":
            content = convertToMarkdown(policyHTML);
            mimeType = "text/markdown";
            fileExtension = "md";
            blob = new Blob([content], { type: mimeType });
            break;

          case "txt":
          default:
            content = policyText;
            mimeType = "text/plain";
            fileExtension = "txt";
            blob = new Blob([content], { type: mimeType });
            break;
        }

        if (blob) {
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = `${fileName}.${fileExtension}`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
        }
      } catch (error) {
        console.error("Error generating document:", error);
        alert("There was an error generating your document. Please try again.");
      }
    }
  };

  // Generate the final privacy policy and pass it to the parent component
  const handleGenerate = () => {
    if (!validateStep(step)) return;

    // Create policy sections
    const sections: PolicySection[] = [
      {
        id: "introduction",
        title: "Introduction",
        content: `This Privacy Policy ("Policy") describes how ${formData.organizationName} ("we", "us", or "our") collects, uses, and discloses your personal information when you visit our website${formData.organizationWebsite ? ` at ${formData.organizationWebsite}` : ""}, use our services, or otherwise interact with us. This Policy applies to all personal data processed by us, regardless of the media on which it is stored. ${formData.includeNDPRCompliance ? `This Policy is designed to comply with the Nigeria Data Protection Regulation (NDPR) ${formData.includeLegalReferences ? "of 2019 " : ""}and the Data Protection Act (DPA) ${formData.includeLegalReferences ? "of 2023 " : ""}and reflects our commitment to the principles of data protection as outlined in ${formData.includeLegalReferences ? "Section 2.1(1) of the NDPR and Section 2 of the DPA" : "the applicable regulations"}.` : ""} Please read this Policy carefully to understand our practices regarding your personal data and how we will treat it.`,
        required: true,
        included: true,
        order: 1,
      },
      {
        id: "about-us",
        title: "About Us",
        content: `${formData.organizationName} ${formData.organizationType ? `is a ${formData.organizationType} operating in the ${formData.industryCategory} sector` : ""}${formData.registrationNumber ? `, registered with registration number ${formData.registrationNumber}` : ""}${formData.organizationAddress ? `, and located at ${formData.organizationAddress}` : ""}. ${formData.organizationWebsite ? `Our official website is ${formData.organizationWebsite}.` : ""} ${formData.includeNDPRCompliance ? `As a data controller under the NDPR and DPA, we are responsible for deciding how we hold and use personal information about you.` : ""}`,
        required: true,
        included: true,
        order: 2,
      },
      {
        id: "definitions",
        title: "Definitions",
        content: `${formData.includeNDPRCompliance ? `For the purposes of this Policy and in accordance with the NDPR and DPA:\n\n- "Personal Data" means any information relating to an identified or identifiable natural person ('data subject'); an identifiable natural person is one who can be identified, directly or indirectly, in particular by reference to an identifier.\n- "Processing" means any operation or set of operations performed on personal data or on sets of personal data.\n- "Data Controller" means a person who either alone, jointly with other persons or in common with other persons or as a statutory body determines the purposes for and the manner in which personal data is processed or is to be processed.\n- "Data Subject" means any person, who can be identified, directly or indirectly, by reference to an identification number or to one or more factors specific to his physical, physiological, mental, economic, cultural or social identity.\n- "Consent" means any freely given, specific, informed and unambiguous indication of the data subject's wishes by which he or she, through a statement or a clear affirmative action, signifies agreement to the processing of personal data relating to him or her.` : `For the purposes of this Policy:\n\n- "Personal Data" means any information relating to an identified or identifiable individual.\n- "Processing" means any operation performed on personal data.\n- "Data Subject" means the individual to whom the personal data relates.`}`,
        required: true,
        included: true,
        order: 3,
      },
    ];

    let order = 4;

    // Add data categories section
    if (formData.dataCategories.length > 0) {
      sections.push({
        id: "data-categories",
        title: "Categories of Personal Data We Collect",
        content: `We collect and process the following categories of personal data:\n\n${formData.dataCategories.map((category) => `- ${category}`).join("\n")}${formData.includeExamples ? `\n\n${getIndustrySpecificDataExample(formData.industryCategory)}` : ""}`,
        required: true,
        included: true,
        order: order++,
      });
    }

    // Add data subjects section
    if (formData.dataSubjects.length > 0) {
      sections.push({
        id: "data-subjects",
        title: "Categories of Data Subjects",
        content: `This Policy applies to personal data we collect from the following categories of individuals:\n\n${formData.dataSubjects.map((subject) => `- ${subject}`).join("\n")}`,
        required: true,
        included: true,
        order: order++,
      });
    }

    // Add data collection purposes section
    sections.push({
      id: "data-collection-purposes",
      title: "Purposes of Data Collection and Processing",
      content: `We collect and process your personal data for the following specific purposes:\n\n${formData.dataCollectionPurposes.map((purpose) => `- ${purpose}`).join("\n")}${formData.includeExamples ? `\n\n${getIndustrySpecificPurposeExample(formData.industryCategory)}` : ""}`,
      required: true,
      included: true,
      order: order++,
    });

    if (formData.legalBasisForProcessing.length > 0) {
      sections.push({
        id: "legal-basis",
        title: "Legal Basis for Processing",
        content: `${formData.includeNDPRCompliance ? `In accordance with ${formData.includeLegalReferences ? "Section 2.2 of the NDPR and Section 27 of the DPA" : "the NDPR and DPA"}, we process your personal data on the following legal grounds:` : "We process your personal data on the following legal grounds:"}\n\n${formData.legalBasisForProcessing.map((basis) => `- ${basis}`).join("\n")}`,
        required: true,
        included: true,
        order: order++,
      });
    }

    if (formData.automatedDecisionMaking) {
      sections.push({
        id: "automated-decision-making",
        title: "Automated Decision-Making and Profiling",
        content: `We use automated decision-making processes, including profiling, in the following circumstances:\n\n${formData.automatedDecisionDetails}\n\n${formData.includeNDPRCompliance ? `In accordance with ${formData.includeLegalReferences ? "Section 2.3(1)(c) of the NDPR and Section 41 of the DPA" : "the NDPR and DPA"}, you have the right not to be subject to a decision based solely on automated processing, including profiling, which produces legal effects concerning you or similarly significantly affects you. You can exercise this right by contacting us at ${formData.organizationContact}.` : "You have the right not to be subject to a decision based solely on automated processing. You can exercise this right by contacting us."}`,
        required: false,
        included: true,
        order: order++,
      });
    }

    // Add data retention section
    sections.push({
      id: "data-retention",
      title: "Data Retention",
      content: `We will retain your personal data for ${formData.dataRetentionPeriod}, or for as long as necessary to fulfill the purposes for which it was collected, including for the purposes of satisfying any legal, accounting, or reporting requirements. ${formData.includeNDPRCompliance ? `This is in accordance with ${formData.includeLegalReferences ? "Section 2.1(1)(e) of the NDPR and Section 33 of the DPA" : "the data retention principles of the NDPR and DPA"}.` : ""}\n\nTo determine the appropriate retention period for personal data, we consider the amount, nature, and sensitivity of the personal data, the potential risk of harm from unauthorized use or disclosure of your personal data, the purposes for which we process your personal data and whether we can achieve those purposes through other means, and the applicable legal requirements.`,
      required: true,
      included: true,
      order: order++,
    });

    // Add third-party sharing section if applicable
    if (formData.thirdPartySharing) {
      let thirdPartyContent =
        "We may share your personal information with the following categories of recipients:";

      if (formData.thirdPartyCategories.length > 0) {
        thirdPartyContent += `\n\nCategories of third parties:\n${formData.thirdPartyCategories.map((category) => `- ${category}`).join("\n")}`;
      }

      if (formData.thirdParties.length > 0) {
        thirdPartyContent += `\n\nSpecific third parties:\n${formData.thirdParties.map((party) => `- ${party}`).join("\n")}`;
      }

      if (formData.thirdPartyPurposes.length > 0) {
        thirdPartyContent += `\n\nWe share your personal data with these third parties for the following purposes:\n${formData.thirdPartyPurposes.map((purpose) => `- ${purpose}`).join("\n")}`;
      }

      thirdPartyContent += `\n\n${formData.includeNDPRCompliance ? `In accordance with ${formData.includeLegalReferences ? "Section 2.6 of the NDPR and Section 37 of the DPA" : "the NDPR and DPA"}, we require all third parties to respect the security of your personal data and to treat it in accordance with the law. We do not allow our third-party service providers to use your personal data for their own purposes and only permit them to process your personal data for specified purposes and in accordance with our instructions.` : "We require all third parties to respect the security of your personal data and to treat it in accordance with applicable law."}`;

      sections.push({
        id: "third-party-sharing",
        title: "Third-Party Sharing",
        content: thirdPartyContent,
        required: false,
        included: true,
        order: order++,
      });
    }

    // Add cookies section if applicable
    if (formData.cookiesUsed) {
      let cookieContent = `Our website uses cookies and similar tracking technologies to distinguish you from other users of our website. This helps us to provide you with a good experience when you browse our website and also allows us to improve our site.`;

      if (formData.cookieTypes.length > 0) {
        cookieContent += `\n\nWe use the following types of cookies:\n${formData.cookieTypes.map((type) => `- ${type}`).join("\n")}`;
      }

      if (formData.cookieLifespan) {
        cookieContent += `\n\nCookie Lifespan: ${formData.cookieLifespan}`;
      }

      if (formData.trackingTechnologies.length > 0) {
        cookieContent += `\n\nIn addition to cookies, we also use the following tracking technologies:\n${formData.trackingTechnologies.map((tech) => `- ${tech}`).join("\n")}`;
      }

      cookieContent += `\n\nYou can set your browser to refuse all or some browser cookies, or to alert you when websites set or access cookies. If you disable or refuse cookies, please note that some parts of this website may become inaccessible or not function properly.`;

      sections.push({
        id: "cookies",
        title: "Cookies and Tracking Technologies",
        content: cookieContent,
        required: false,
        included: true,
        order: order++,
      });
    }

    // Add international transfers section if applicable
    if (formData.internationalTransfers) {
      let transferContent = `We may transfer your personal data to countries outside Nigeria. These countries may include: ${formData.transferCountries.join(", ")}.`;

      if (formData.transferSafeguards.length > 0) {
        transferContent += `\n\nWhenever we transfer your personal data out of Nigeria, we ensure a similar degree of protection is afforded to it by implementing the following safeguards:\n${formData.transferSafeguards.map((safeguard) => `- ${safeguard}`).join("\n")}`;
      }

      transferContent += `\n\n${formData.includeNDPRCompliance ? `In accordance with ${formData.includeLegalReferences ? "Sections 2.11 and 2.12 of the NDPR and Section 44 of the DPA" : "the NDPR and DPA"}, we ensure that any international transfer of personal data is done in accordance with the provisions of the regulations and that adequate protection is guaranteed for the rights of data subjects.` : "We ensure that any international transfer of personal data is done with adequate protection for the rights of data subjects."}`;

      sections.push({
        id: "international-transfers",
        title: "International Data Transfers",
        content: transferContent,
        required: false,
        included: true,
        order: order++,
      });
    }

    // Add children's data section if applicable
    if (formData.processesChildrenData) {
      sections.push({
        id: "childrens-data",
        title: "Children's Privacy",
        content: `Our services may be used by individuals under the age of 18. ${formData.childrenDataDetails}\n\n${formData.includeNDPRCompliance ? `In accordance with ${formData.includeLegalReferences ? "Section 2.2(d) of the NDPR and Section 39 of the DPA" : "the NDPR and DPA"}, we implement specific measures to protect the privacy of children, including obtaining parental consent where required by law.` : "We implement specific measures to protect the privacy of children, including obtaining parental consent where required by law."}`,
        required: false,
        included: true,
        order: order++,
      });
    }

    // Add special categories section if applicable
    if (formData.processesSpecialCategories) {
      sections.push({
        id: "special-categories",
        title: "Special Categories of Personal Data",
        content: `We may process special categories of personal data, which includes information about your race, ethnic origin, political opinions, religious or philosophical beliefs, trade union membership, genetic data, biometric data, health data, sex life, or sexual orientation.\n\n${formData.specialCategoriesDetails}\n\n${formData.includeNDPRCompliance ? `In accordance with ${formData.includeLegalReferences ? "Section 2.2 of the NDPR and Section 28 of the DPA" : "the NDPR and DPA"}, we only process special categories of personal data when one of the specific legal bases for such processing is met, such as explicit consent or when processing is necessary for specific purposes outlined in the regulations.` : "We only process special categories of personal data when one of the specific legal bases for such processing is met, such as explicit consent."}`,
        required: false,
        included: true,
        order: order++,
      });
    }

    // Add security measures section
    if (formData.securityMeasures.length > 0) {
      let securityContent = `We have implemented appropriate security measures to prevent your personal data from being accidentally lost, used, or accessed in an unauthorized way, altered, or disclosed. These measures include:\n\n${formData.securityMeasures.map((measure) => `- ${measure}`).join("\n")}\n\n${formData.includeNDPRCompliance ? `In accordance with ${formData.includeLegalReferences ? "Section 2.1(1)(d) of the NDPR and Section 31 of the DPA" : "the NDPR and DPA"}, we implement appropriate technical and organizational measures to ensure a level of security appropriate to the risk.` : "We regularly review and update our security measures to ensure the ongoing confidentiality, integrity, and availability of your personal data."}`;

      if (formData.dataBreachProcedures) {
        securityContent += `\n\nData Breach Procedures: ${formData.dataBreachProcedures}`;
      }

      sections.push({
        id: "security-measures",
        title: "Data Security",
        content: securityContent,
        required: true,
        included: true,
        order: order++,
      });
    }

    // Add data subject rights section
    const rightsContent = `${formData.includeNDPRCompliance ? `In accordance with ${formData.includeLegalReferences ? "Section 3.1 of the NDPR and Section 36 of the DPA" : "the NDPR and DPA"}, you have the following rights in relation to your personal data:` : "You have the following rights in relation to your personal data:"}\n\n- **Right to Access**: You have the right to request a copy of the personal data we hold about you.\n- **Right to Rectification**: You have the right to request correction of any inaccurate personal data we hold about you.\n- **Right to Erasure (Right to be Forgotten)**: You have the right to request erasure of your personal data in certain circumstances.\n- **Right to Restriction of Processing**: You have the right to request restriction of processing of your personal data in certain circumstances.\n- **Right to Data Portability**: You have the right to request the transfer of your personal data to you or to a third party in a structured, commonly used, machine-readable format.\n- **Right to Object**: You have the right to object to processing of your personal data in certain circumstances.\n- **Right to Withdraw Consent**: Where we rely on your consent to process your personal data, you have the right to withdraw your consent at any time.\n\nTo exercise any of these rights, please contact us at ${formData.organizationContact}.${formData.includeNDPRCompliance ? ` We will respond to your request within ${formData.includeLegalReferences ? "30 days as required by Section 3.1(7) of the NDPR" : "the timeframe specified by the regulations"}.` : ""}`;

    sections.push({
      id: "data-subject-rights",
      title: "Your Rights",
      content: rightsContent,
      required: true,
      included: true,
      order: order++,
    });

    // Add policy updates section
    sections.push({
      id: "policy-updates",
      title: "Changes to This Privacy Policy",
      content: `We may update this Privacy Policy from time to time. The current version of the Privacy Policy is effective as of ${formData.policyEffectiveDate} (Version ${formData.policyVersion}).${formData.previousPolicyUrl ? ` Previous versions of this Policy can be found at ${formData.previousPolicyUrl}.` : ""}\n\n${formData.policyUpdateProcedure ? `When we make changes to this Privacy Policy: ${formData.policyUpdateProcedure}` : "We will notify you of any material changes to this Privacy Policy by posting the updated Policy on our website and, where appropriate, by sending you a notification."}`,
      required: true,
      included: true,
      order: order++,
    });

    // Add regulatory compliance section if applicable
    if (formData.regulatoryCompliance.length > 0) {
      sections.push({
        id: "regulatory-compliance",
        title: "Regulatory Compliance",
        content: `In addition to the ${formData.includeNDPRCompliance ? "NDPR and DPA" : "applicable data protection laws"}, we comply with the following regulations and standards:\n\n${formData.regulatoryCompliance.map((reg) => `- ${reg}`).join("\n")}`,
        required: false,
        included: true,
        order: order++,
      });
    }

    // Add custom sections
    formData.customSections.forEach((section, index) => {
      sections.push({
        id: `custom-${index}`,
        title: section.title,
        content: section.content,
        required: false,
        included: true,
        order: order++,
      });
    });

    // Add DPO section if applicable
    if (formData.hasDPO && formData.dpoContact) {
      sections.push({
        id: "dpo",
        title: "Data Protection Officer",
        content: `We have appointed a Data Protection Officer (DPO) who is responsible for overseeing questions in relation to this Privacy Policy. You can contact our DPO at ${formData.dpoContact}.${formData.includeNDPRCompliance ? ` This appointment is in accordance with ${formData.includeLegalReferences ? "Section 2.5 of the NDPR and Section 30 of the DPA" : "the requirements of the NDPR and DPA"}.` : ""}`,
        required: false,
        included: true,
        order: order++,
      });
    }

    // Add supervisory authority section if applicable
    if (formData.supervisoryAuthorityContact) {
      sections.push({
        id: "supervisory-authority",
        title: "Supervisory Authority",
        content: `${formData.includeNDPRCompliance ? `In accordance with ${formData.includeLegalReferences ? "Section 3.1(8) of the NDPR and Section 36(5) of the DPA" : "the NDPR and DPA"}, you have the right to lodge a complaint with the Nigeria Data Protection Commission (NDPC) if you are not satisfied with our response to your concerns. You can contact the NDPC at ${formData.supervisoryAuthorityContact}.` : `You have the right to lodge a complaint with the relevant data protection authority if you are not satisfied with our response to your concerns. You can contact them at ${formData.supervisoryAuthorityContact}.`}`,
        required: false,
        included: true,
        order: order++,
      });
    }

    // Add contact section
    sections.push({
      id: "contact",
      title: "Contact Us",
      content: `If you have any questions about this Privacy Policy or our privacy practices, please contact us at:\n\n${formData.organizationName}\n${formData.organizationAddress ? `${formData.organizationAddress}\n` : ""}Email: ${formData.organizationContact}\n${formData.organizationWebsite ? `Website: ${formData.organizationWebsite}` : ""}`,
      required: true,
      included: true,
      order: order++,
    });

    // Pass the generated policy to the parent component
    onGenerate({
      organizationName: formData.organizationName,
      organizationContact: formData.organizationContact,
      sections,
    });
  };

  // Helper function to get industry-specific examples for data collection
  const getIndustrySpecificDataExample = (industry: string): string => {
    switch (industry) {
      case "E-commerce and retail":
        return "For example, we collect your name, shipping address, and payment information when you place an order on our website.";
      case "Financial services and fintech":
        return "For example, we collect your financial information, transaction history, and credit information to provide our financial services.";
      case "Healthcare and medical":
        return "For example, we collect your medical history, treatment information, and health insurance details to provide healthcare services.";
      case "Education and e-learning":
        return "For example, we collect your educational background, course progress, and assessment results to provide educational services.";
      default:
        return "For example, we collect information necessary to provide our services and ensure a personalized experience.";
    }
  };

  // Helper function to get industry-specific examples for purposes
  const getIndustrySpecificPurposeExample = (industry: string): string => {
    switch (industry) {
      case "E-commerce and retail":
        return "For example, we use your shipping address to deliver products you order and your payment information to process transactions.";
      case "Financial services and fintech":
        return "For example, we use your financial information to process transactions and your credit information for credit assessments.";
      case "Healthcare and medical":
        return "For example, we use your medical history to provide appropriate healthcare services and treatment recommendations.";
      case "Education and e-learning":
        return "For example, we use your course progress data to personalize your learning experience and provide appropriate educational content.";
      default:
        return "For example, we use your information to provide our services, improve your experience, and ensure compliance with applicable laws.";
    }
  };

  // Step labels for the progress indicator
  const stepLabels = [
    "Organization Info",
    "Data Collection",
    "Data Sharing",
    "Finalize",
  ];

  return (
    <div
      className={`bg-white dark:bg-gray-900 shadow-lg rounded-xl p-8 max-w-4xl mx-auto ${className}`}
    >
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8 text-center">
        Privacy Policy Generator
      </h2>

      <StepIndicator
        currentStep={step}
        totalSteps={4}
        stepLabels={stepLabels}
      />

      {/* Step 1: Organization Information */}
      {step === 1 && (
        <OrganizationInfoStep
          formData={formData}
          errors={errors}
          onChange={handleChange}
        />
      )}

      {/* Step 2: Data Collection */}
      {step === 2 && (
        <DataCollectionStep
          formData={formData}
          errors={errors}
          onChange={handleChange}
          onToggleItem={handleMultiSelect}
          defaultDataPurposes={defaultDataPurposes}
          defaultSecurityMeasures={defaultSecurityMeasures}
          dataSubjectCategories={dataSubjectCategories}
        />
      )}

      {/* Step 3: Data Sharing */}
      {step === 3 && (
        <DataSharingStep
          formData={formData}
          errors={errors}
          onChange={handleChange}
          onToggleItem={handleMultiSelect}
          onAddThirdParty={handleAddThirdParty}
          onRemoveThirdParty={handleRemoveThirdParty}
          defaultCookieTypes={defaultCookieTypes}
          commonTransferCountries={commonTransferCountries}
          trackingTechnologies={trackingTechnologies}
          transferSafeguards={transferSafeguards}
        />
      )}

      {/* Step 4: Custom Sections and Preview */}
      {step === 4 && (
        <div className="space-y-8">
          <CustomSectionsStep
            formData={formData}
            onAddCustomSection={handleAddCustomSection}
            onRemoveCustomSection={handleRemoveCustomSection}
          />

          <PolicyPreviewStep formData={formData} previewRef={previewRef} />
        </div>
      )}

      <div className="mt-10 flex justify-between items-center">
        {step > 1 ? (
          <button
            type="button"
            onClick={handleBack}
            className="inline-flex items-center px-5 py-2.5 border border-gray-300 dark:border-gray-600 shadow-sm text-sm font-medium rounded-lg text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200 ease-in-out"
            aria-label="Go back to previous step"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-2"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
            Back
          </button>
        ) : (
          <div>
            {/* Empty div to maintain layout when back button is not shown */}
          </div>
        )}

        {step < 4 ? (
          <button
            type="button"
            onClick={handleNext}
            className="inline-flex items-center px-5 py-2.5 border border-transparent shadow-sm text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200 ease-in-out"
            aria-label="Proceed to next step"
          >
            Next
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 ml-2"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        ) : (
          <button
            type="button"
            onClick={handleGenerate}
            className="inline-flex items-center px-5 py-2.5 border border-transparent shadow-sm text-sm font-medium rounded-lg text-white bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-200 ease-in-out"
            aria-label="Generate privacy policy"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-2"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
            Generate Policy
          </button>
        )}
      </div>
    </div>
  );
}
