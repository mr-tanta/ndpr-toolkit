import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import type { PrivacyPolicy, PolicySection } from '../types/privacy';
import type {
  TemplateContext,
  PolicyDraft,
  ComplianceResult,
  ComplianceGap,
  CustomSection,
  PDFExportOptions,
  DOCXExportOptions,
  HTMLExportOptions,
} from '../types/policy-engine';
import { createDefaultContext } from '../types/policy-engine';
import { assemblePolicy } from '../utils/policy-sections';
import { evaluatePolicyCompliance } from '../utils/policy-compliance';
import { exportPDF, exportDOCX, exportHTML, exportMarkdown } from '../utils/policy-export';
import type { StorageAdapter } from '../adapters/types';
import { localStorageAdapter } from '../adapters/local-storage';

export interface UseAdaptivePolicyWizardOptions {
  adapter?: StorageAdapter<PolicyDraft>;
  onComplete?: (policy: PrivacyPolicy) => void;
  onComplianceChange?: (score: number, gaps: ComplianceGap[]) => void;
}

export interface UseAdaptivePolicyWizardReturn {
  // Step management
  currentStep: number;
  goToStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  canProceed: boolean;

  // Template context
  context: TemplateContext;
  updateContext: (updates: Partial<TemplateContext>) => void;
  updateOrg: (updates: Partial<TemplateContext['org']>) => void;
  toggleDataCategory: (categoryId: string) => void;
  togglePurpose: (purpose: string) => void;
  addProcessor: (processor: { name: string; purpose: string; country: string }) => void;
  removeProcessor: (index: number) => void;

  // Generated policy
  policy: PrivacyPolicy | null;
  sections: PolicySection[];

  // Custom sections
  customSections: CustomSection[];
  addCustomSection: (section: Omit<CustomSection, 'id' | 'required'>) => void;
  updateCustomSection: (id: string, updates: Partial<CustomSection>) => void;
  removeCustomSection: (id: string) => void;
  reorderSections: (sectionId: string, direction: 'up' | 'down') => void;
  editSectionContent: (sectionId: string, content: string) => void;
  sectionOverrides: Record<string, string>;

  // Compliance
  complianceScore: number;
  complianceResult: ComplianceResult;
  complianceGaps: ComplianceGap[];
  applyFix: (gapId: string) => void;

  // Export
  handleExportPDF: (options?: PDFExportOptions) => Promise<Blob>;
  handleExportDOCX: (options?: DOCXExportOptions) => Promise<Blob>;
  handleExportHTML: (options?: HTMLExportOptions) => string;
  handleExportMarkdown: () => string;

  // Draft
  isDraftSaved: boolean;
  lastSavedAt: number | null;
  saveDraft: () => Promise<void>;
  discardDraft: () => void;

  // Loading
  isLoading: boolean;
}

const MAX_CUSTOM_SECTIONS = 10;
const DRAFT_KEY = 'ndpr_policy_draft';
const AUTOSAVE_DELAY_MS = 2000;

function generateId(): string {
  return `section_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

function generateDraftId(): string {
  return `draft_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

function buildPrivacyPolicy(
  context: TemplateContext,
  sections: PolicySection[],
  draftId: string,
): PrivacyPolicy {
  const now = Date.now();
  return {
    id: draftId,
    title: `Privacy Policy${context.org.name ? ` — ${context.org.name}` : ''}`,
    templateId: 'adaptive-policy-wizard',
    organizationInfo: {
      name: context.org.name,
      website: context.org.website,
      privacyEmail: context.org.privacyEmail,
      address: context.org.address,
      dpoName: context.org.dpoName,
      dpoEmail: context.org.dpoEmail,
      industry: context.org.industry,
    },
    sections,
    variableValues: {},
    effectiveDate: now,
    lastUpdated: now,
    version: '1.0',
    applicableFrameworks: ['ndpa', 'ndpr'],
  };
}

export function useAdaptivePolicyWizard(
  options: UseAdaptivePolicyWizardOptions = {},
): UseAdaptivePolicyWizardReturn {
  const { onComplete, onComplianceChange } = options;

  // Stable ref for the adapter — avoids stale closures in callbacks
  const adapterRef = useRef<StorageAdapter<PolicyDraft>>(
    options.adapter ?? localStorageAdapter<PolicyDraft>(DRAFT_KEY),
  );
  // Keep in sync if the caller swaps adapters between renders
  adapterRef.current = options.adapter ?? localStorageAdapter<PolicyDraft>(DRAFT_KEY);

  // Stable ref for a draft ID so it persists across renders without being
  // part of state (no extra re-renders)
  const draftIdRef = useRef<string>(generateDraftId());

  // ── Core state ────────────────────────────────────────────────────────────

  const [currentStep, setCurrentStep] = useState(1);
  const [context, setContext] = useState<TemplateContext>(createDefaultContext);
  const [customSections, setCustomSections] = useState<CustomSection[]>([]);
  const [sectionOverrides, setSectionOverrides] = useState<Record<string, string>>({});
  const [sectionOrder, setSectionOrder] = useState<string[]>([]);
  const [isDraftSaved, setIsDraftSaved] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Debounce timer ref — ref so mutations don't trigger re-renders
  const autoSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Load draft from adapter on mount ─────────────────────────────────────

  useEffect(() => {
    let cancelled = false;

    const applyDraft = (draft: PolicyDraft | null) => {
      if (!draft) return;
      draftIdRef.current = draft.id;
      setContext(draft.templateContext);
      setCustomSections(draft.customSections);
      setSectionOverrides(draft.sectionOverrides);
      setSectionOrder(draft.sectionOrder);
      setCurrentStep(draft.currentStep);
      setLastSavedAt(draft.lastSavedAt);
      setIsDraftSaved(true);
    };

    try {
      const result = adapterRef.current.load();
      if (result instanceof Promise) {
        result.then(
          (draft) => {
            if (!cancelled) {
              applyDraft(draft);
              setIsLoading(false);
            }
          },
          () => {
            if (!cancelled) setIsLoading(false);
          },
        );
      } else {
        applyDraft(result);
        setIsLoading(false);
      }
    } catch {
      if (!cancelled) setIsLoading(false);
    }

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Assemble sections (generated + custom + overrides + order) ────────────

  const sections = useMemo<PolicySection[]>(() => {
    const generated = assemblePolicy(context);

    // Apply overrides to generated sections
    const withOverrides = generated.map((sec) =>
      sectionOverrides[sec.id]
        ? { ...sec, template: sectionOverrides[sec.id] }
        : sec,
    );

    // Convert custom sections to PolicySection shape
    const customAsSections: PolicySection[] = customSections.map((cs) => ({
      id: cs.id,
      title: cs.title,
      template: sectionOverrides[cs.id] ?? cs.content,
      order: cs.order,
      required: false,
      included: true,
    }));

    const all = [...withOverrides, ...customAsSections];

    // Apply sectionOrder if present; otherwise sort by `order`
    if (sectionOrder.length > 0) {
      const orderMap = new Map(sectionOrder.map((id, i) => [id, i]));
      return [...all].sort((a, b) => {
        const ia = orderMap.has(a.id) ? orderMap.get(a.id)! : all.length;
        const ib = orderMap.has(b.id) ? orderMap.get(b.id)! : all.length;
        return ia - ib;
      });
    }

    return [...all].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  }, [context, customSections, sectionOverrides, sectionOrder]);

  // ── Build PrivacyPolicy object ────────────────────────────────────────────

  const policy = useMemo<PrivacyPolicy | null>(() => {
    if (!context.org.name && !context.org.privacyEmail) return null;
    return buildPrivacyPolicy(context, sections, draftIdRef.current);
  }, [context, sections]);

  // ── Compliance (memoised) ─────────────────────────────────────────────────

  const emptyPolicy = useMemo<PrivacyPolicy>(
    () => buildPrivacyPolicy(createDefaultContext(), [], draftIdRef.current),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const complianceResult = useMemo<ComplianceResult>(() => {
    return evaluatePolicyCompliance(policy ?? emptyPolicy, context);
  }, [policy, context, emptyPolicy]);

  const complianceScore = complianceResult.percentage;
  const complianceGaps = complianceResult.gaps;

  // Notify caller when compliance changes
  const prevComplianceRef = useRef<{ score: number; gaps: ComplianceGap[] }>({
    score: -1,
    gaps: [],
  });
  useEffect(() => {
    const prev = prevComplianceRef.current;
    if (
      onComplianceChange &&
      (complianceScore !== prev.score || complianceGaps !== prev.gaps)
    ) {
      onComplianceChange(complianceScore, complianceGaps);
    }
    prevComplianceRef.current = { score: complianceScore, gaps: complianceGaps };
  }, [complianceScore, complianceGaps, onComplianceChange]);

  // ── canProceed validation ─────────────────────────────────────────────────

  const canProceed = useMemo(() => {
    switch (currentStep) {
      case 1:
        return (
          context.org.name.trim().length > 0 &&
          context.org.privacyEmail.trim().length > 0
        );
      case 2:
        return context.dataCategories.some((c) => c.selected);
      case 3:
        return context.purposes.length > 0;
      case 4:
        return true;
      default:
        return false;
    }
  }, [currentStep, context]);

  // ── Step management ───────────────────────────────────────────────────────

  const goToStep = useCallback((step: number) => {
    setCurrentStep(Math.min(Math.max(1, step), 4));
  }, []);

  const nextStep = useCallback(() => {
    setCurrentStep((s) => Math.min(s + 1, 4));
  }, []);

  const prevStep = useCallback(() => {
    setCurrentStep((s) => Math.max(s - 1, 1));
  }, []);

  // ── Context updaters ──────────────────────────────────────────────────────

  const updateContext = useCallback((updates: Partial<TemplateContext>) => {
    setContext((prev) => ({ ...prev, ...updates }));
  }, []);

  const updateOrg = useCallback((updates: Partial<TemplateContext['org']>) => {
    setContext((prev) => ({ ...prev, org: { ...prev.org, ...updates } }));
  }, []);

  const toggleDataCategory = useCallback((categoryId: string) => {
    setContext((prev) => ({
      ...prev,
      dataCategories: prev.dataCategories.map((cat) =>
        cat.id === categoryId ? { ...cat, selected: !cat.selected } : cat,
      ),
    }));
  }, []);

  const togglePurpose = useCallback((purpose: string) => {
    setContext((prev) => {
      const exists = prev.purposes.includes(purpose as any);
      return {
        ...prev,
        purposes: exists
          ? prev.purposes.filter((p) => p !== purpose)
          : [...prev.purposes, purpose as any],
      };
    });
  }, []);

  const addProcessor = useCallback(
    (processor: { name: string; purpose: string; country: string }) => {
      setContext((prev) => ({
        ...prev,
        thirdPartyProcessors: [...prev.thirdPartyProcessors, processor],
      }));
    },
    [],
  );

  const removeProcessor = useCallback((index: number) => {
    setContext((prev) => ({
      ...prev,
      thirdPartyProcessors: prev.thirdPartyProcessors.filter((_, i) => i !== index),
    }));
  }, []);

  // ── Custom sections ───────────────────────────────────────────────────────

  const addCustomSection = useCallback(
    (section: Omit<CustomSection, 'id' | 'required'>) => {
      setCustomSections((prev) => {
        if (prev.length >= MAX_CUSTOM_SECTIONS) return prev;
        return [
          ...prev,
          { ...section, id: generateId(), required: false as const },
        ];
      });
    },
    [],
  );

  const updateCustomSection = useCallback(
    (id: string, updates: Partial<CustomSection>) => {
      setCustomSections((prev) =>
        prev.map((cs) => (cs.id === id ? { ...cs, ...updates } : cs)),
      );
    },
    [],
  );

  const removeCustomSection = useCallback((id: string) => {
    setCustomSections((prev) => prev.filter((cs) => cs.id !== id));
    setSectionOrder((prev) => prev.filter((sid) => sid !== id));
    setSectionOverrides((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  }, []);

  const reorderSections = useCallback(
    (sectionId: string, direction: 'up' | 'down') => {
      // Build the canonical ordered list from current sections
      setSectionOrder((prevOrder) => {
        const allIds =
          prevOrder.length > 0
            ? prevOrder
            : sections.map((s) => s.id);

        const idx = allIds.indexOf(sectionId);
        if (idx === -1) {
          // Section not yet in the order array — initialise from sections
          const freshIds = sections.map((s) => s.id);
          const fi = freshIds.indexOf(sectionId);
          if (fi === -1) return prevOrder;
          const swapIdx = direction === 'up' ? fi - 1 : fi + 1;
          if (swapIdx < 0 || swapIdx >= freshIds.length) return freshIds;
          const arr = [...freshIds];
          [arr[fi], arr[swapIdx]] = [arr[swapIdx], arr[fi]];
          return arr;
        }

        const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
        if (swapIdx < 0 || swapIdx >= allIds.length) return allIds;
        const arr = [...allIds];
        [arr[idx], arr[swapIdx]] = [arr[swapIdx], arr[idx]];
        return arr;
      });
    },
    [sections],
  );

  const editSectionContent = useCallback((sectionId: string, content: string) => {
    setSectionOverrides((prev) => ({ ...prev, [sectionId]: content }));
  }, []);

  // ── Compliance fix ────────────────────────────────────────────────────────

  const applyFix = useCallback(
    (gapId: string) => {
      const gap = complianceGaps.find((g) => g.requirementId === gapId);
      if (!gap) return;

      switch (gap.fixType) {
        case 'fill_field': {
          // Navigate to step 1 (org details) for most fill_field gaps
          const step1Ids = ['controller-identity', 'dpo-contact-info', 'policy-effective-date'];
          const step2Ids = ['data-categories-disclosed'];
          const step3Ids = ['purpose-of-processing'];
          if (step2Ids.includes(gapId)) {
            setCurrentStep(2);
          } else if (step3Ids.includes(gapId)) {
            setCurrentStep(3);
          } else if (step1Ids.includes(gapId)) {
            setCurrentStep(1);
          } else {
            setCurrentStep(1);
          }
          break;
        }
        case 'add_section': {
          if (!gap.suggestedContent) break;
          setCustomSections((prev) => {
            if (prev.length >= MAX_CUSTOM_SECTIONS) return prev;
            return [
              ...prev,
              {
                id: generateId(),
                title: gap.requirement,
                content: gap.suggestedContent!,
                order: 999,
                required: false as const,
              },
            ];
          });
          break;
        }
        case 'add_content': {
          if (!gap.suggestedContent) break;
          // Find the most relevant section to append to, or use data-subject-rights
          const targetId = 'data-subject-rights';
          setSectionOverrides((prev) => {
            const existing =
              prev[targetId] ??
              sections.find((s) => s.id === targetId)?.template ??
              '';
            return {
              ...prev,
              [targetId]: `${existing}\n\n${gap.suggestedContent}`.trim(),
            };
          });
          break;
        }
      }
    },
    [complianceGaps, sections],
  );

  // ── Draft persistence helpers ─────────────────────────────────────────────

  const buildDraft = useCallback(
    (step: number): PolicyDraft => ({
      id: draftIdRef.current,
      templateContext: context,
      customSections,
      sectionOverrides,
      sectionOrder,
      currentStep: step,
      lastSavedAt: Date.now(),
      status: 'draft',
    }),
    [context, customSections, sectionOverrides, sectionOrder],
  );

  const saveDraft = useCallback(async () => {
    const draft = buildDraft(currentStep);
    try {
      await Promise.resolve(adapterRef.current.save(draft));
      setLastSavedAt(draft.lastSavedAt);
      setIsDraftSaved(true);
    } catch (err) {
      console.warn('[ndpr-toolkit] Failed to save draft:', err);
    }
  }, [buildDraft, currentStep]);

  const discardDraft = useCallback(() => {
    Promise.resolve(adapterRef.current.remove()).catch((err) => {
      console.warn('[ndpr-toolkit] Failed to remove draft:', err);
    });
    // Reset state
    draftIdRef.current = generateDraftId();
    setContext(createDefaultContext());
    setCustomSections([]);
    setSectionOverrides({});
    setSectionOrder([]);
    setCurrentStep(1);
    setIsDraftSaved(false);
    setLastSavedAt(null);
  }, []);

  // ── Debounced auto-save ───────────────────────────────────────────────────

  useEffect(() => {
    if (isLoading) return; // Don't auto-save until initial load is done

    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }

    autoSaveTimerRef.current = setTimeout(() => {
      const draft = buildDraft(currentStep);
      Promise.resolve(adapterRef.current.save(draft))
        .then(() => {
          setLastSavedAt(draft.lastSavedAt);
          setIsDraftSaved(true);
        })
        .catch((err) => {
          console.warn('[ndpr-toolkit] Auto-save failed:', err);
        });
    }, AUTOSAVE_DELAY_MS);

    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, [context, customSections, sectionOverrides, sectionOrder, currentStep, isLoading, buildDraft]);

  // ── Notify onComplete when step 4 is reached and policy is built ──────────

  useEffect(() => {
    if (currentStep === 4 && policy && onComplete) {
      onComplete(policy);
    }
  }, [currentStep, policy, onComplete]);

  // ── Export handlers ───────────────────────────────────────────────────────

  const handleExportPDF = useCallback(
    async (exportOptions?: PDFExportOptions): Promise<Blob> => {
      const p = policy ?? buildPrivacyPolicy(context, sections, draftIdRef.current);
      return exportPDF(p, exportOptions);
    },
    [policy, context, sections],
  );

  const handleExportDOCX = useCallback(
    async (exportOptions?: DOCXExportOptions): Promise<Blob> => {
      const p = policy ?? buildPrivacyPolicy(context, sections, draftIdRef.current);
      return exportDOCX(p, exportOptions);
    },
    [policy, context, sections],
  );

  const handleExportHTML = useCallback(
    (exportOptions?: HTMLExportOptions): string => {
      const p = policy ?? buildPrivacyPolicy(context, sections, draftIdRef.current);
      return exportHTML(p, exportOptions);
    },
    [policy, context, sections],
  );

  const handleExportMarkdown = useCallback((): string => {
    const p = policy ?? buildPrivacyPolicy(context, sections, draftIdRef.current);
    return exportMarkdown(p);
  }, [policy, context, sections]);

  // ── Return ────────────────────────────────────────────────────────────────

  return {
    // Step management
    currentStep,
    goToStep,
    nextStep,
    prevStep,
    canProceed,

    // Template context
    context,
    updateContext,
    updateOrg,
    toggleDataCategory,
    togglePurpose,
    addProcessor,
    removeProcessor,

    // Generated policy
    policy,
    sections,

    // Custom sections
    customSections,
    addCustomSection,
    updateCustomSection,
    removeCustomSection,
    reorderSections,
    editSectionContent,
    sectionOverrides,

    // Compliance
    complianceScore,
    complianceResult,
    complianceGaps,
    applyFix,

    // Export
    handleExportPDF,
    handleExportDOCX,
    handleExportHTML,
    handleExportMarkdown,

    // Draft
    isDraftSaved,
    lastSavedAt,
    saveDraft,
    discardDraft,

    // Loading
    isLoading,
  };
}
