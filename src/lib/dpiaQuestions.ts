import { RiskAssessmentQuestion } from "@/types";

export const dpiaQuestions: RiskAssessmentQuestion[] = [
  {
    id: "data-collection-1",
    text: "Does your project involve collecting personal data directly from individuals?",
    type: "radio",
    required: true,
    options: [
      { value: "1", label: "No personal data is collected" },
      {
        value: "2",
        label: "Limited personal data is collected with clear consent",
      },
      {
        value: "3",
        label: "Significant personal data is collected with consent",
      },
      { value: "4", label: "Extensive personal data is collected" },
    ],
  },
  {
    id: "data-collection-2",
    text: "Does your project involve collecting sensitive personal data (e.g., health, biometric, religious beliefs)?",
    type: "radio",
    required: true,
    options: [
      { value: "1", label: "No sensitive data is collected" },
      { value: "2", label: "Limited sensitive data with explicit consent" },
      { value: "3", label: "Significant sensitive data with explicit consent" },
      { value: "4", label: "Extensive sensitive data collection" },
    ],
  },
  {
    id: "data-collection-3",
    text: "Does your project collect data from children or vulnerable individuals?",
    type: "radio",
    required: true,
    options: [
      { value: "1", label: "No data from children or vulnerable individuals" },
      { value: "2", label: "Limited data with parental/guardian consent" },
      { value: "3", label: "Significant data with enhanced safeguards" },
      { value: "4", label: "Extensive data from vulnerable groups" },
    ],
  },
  {
    id: "data-processing-1",
    text: "Does your project involve automated decision-making or profiling?",
    type: "radio",
    required: true,
    options: [
      { value: "1", label: "No automated decision-making" },
      { value: "2", label: "Limited automation with human oversight" },
      { value: "3", label: "Significant automation with opt-out options" },
      {
        value: "4",
        label: "Extensive automated decisions affecting individuals",
      },
    ],
  },
  {
    id: "data-processing-2",
    text: "Does your project involve processing data for purposes beyond what was initially collected for?",
    type: "radio",
    required: true,
    options: [
      { value: "1", label: "Processing only for original purpose" },
      { value: "2", label: "Limited secondary processing with notice" },
      { value: "3", label: "Significant secondary processing with consent" },
      { value: "4", label: "Extensive repurposing of data" },
    ],
  },
  {
    id: "data-processing-3",
    text: "Does your project combine data from multiple sources?",
    type: "radio",
    required: true,
    options: [
      { value: "1", label: "No data combination" },
      { value: "2", label: "Limited combination from controlled sources" },
      { value: "3", label: "Significant combination with transparency" },
      { value: "4", label: "Extensive data aggregation from various sources" },
    ],
  },
  {
    id: "data-sharing-1",
    text: "Does your project involve sharing personal data with third parties?",
    type: "radio",
    required: true,
    options: [
      { value: "1", label: "No third-party sharing" },
      { value: "2", label: "Limited sharing with contractual safeguards" },
      {
        value: "3",
        label: "Significant sharing with data processing agreements",
      },
      { value: "4", label: "Extensive sharing with multiple third parties" },
    ],
  },
  {
    id: "data-sharing-2",
    text: "Does your project involve transferring data outside Nigeria?",
    type: "radio",
    required: true,
    options: [
      { value: "1", label: "No international transfers" },
      {
        value: "2",
        label: "Limited transfers to countries with adequate protection",
      },
      {
        value: "3",
        label: "Significant transfers with standard contractual clauses",
      },
      {
        value: "4",
        label: "Extensive transfers to countries without adequate protection",
      },
    ],
  },
  {
    id: "security-1",
    text: "What level of security measures does your project implement?",
    type: "radio",
    required: true,
    options: [
      {
        value: "1",
        label:
          "Comprehensive security with encryption, access controls, and regular audits",
      },
      { value: "2", label: "Strong security measures with some monitoring" },
      {
        value: "3",
        label: "Basic security measures meeting minimum requirements",
      },
      { value: "4", label: "Limited security measures" },
    ],
  },
  {
    id: "security-2",
    text: "Does your project have a data breach response plan?",
    type: "radio",
    required: true,
    options: [
      { value: "1", label: "Comprehensive breach plan with regular testing" },
      {
        value: "2",
        label: "Documented breach plan with assigned responsibilities",
      },
      { value: "3", label: "Basic breach notification procedure" },
      { value: "4", label: "No formal breach response plan" },
    ],
  },
  {
    id: "data-subject-rights-1",
    text: "How does your project facilitate data subject rights (access, rectification, erasure, etc.)?",
    type: "radio",
    required: true,
    options: [
      { value: "1", label: "Automated self-service portal for all rights" },
      {
        value: "2",
        label: "Documented procedures with reasonable response times",
      },
      { value: "3", label: "Basic manual process for handling requests" },
      { value: "4", label: "Limited or no formal process for rights requests" },
    ],
  },
  {
    id: "data-subject-rights-2",
    text: "Does your project provide clear privacy information to data subjects?",
    type: "radio",
    required: true,
    options: [
      {
        value: "1",
        label: "Comprehensive, layered privacy notices in plain language",
      },
      {
        value: "2",
        label: "Clear privacy policy with all required information",
      },
      { value: "3", label: "Basic privacy notice covering essential elements" },
      { value: "4", label: "Minimal or complex privacy information" },
    ],
  },
];
