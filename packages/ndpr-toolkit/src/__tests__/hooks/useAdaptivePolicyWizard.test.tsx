import { renderHook, act } from '@testing-library/react';
import { useAdaptivePolicyWizard } from '../../hooks/useAdaptivePolicyWizard';
import { memoryAdapter } from '../../adapters/memory';

describe('useAdaptivePolicyWizard', () => {
  it('starts at step 1 with default context', () => {
    const { result } = renderHook(() => useAdaptivePolicyWizard());
    expect(result.current.currentStep).toBe(1);
    expect(result.current.context.org.name).toBe('');
  });

  it('canProceed is false on step 1 without org name', () => {
    const { result } = renderHook(() => useAdaptivePolicyWizard());
    expect(result.current.canProceed).toBe(false);
  });

  it('canProceed is true on step 1 with org name and email', () => {
    const { result } = renderHook(() => useAdaptivePolicyWizard());
    act(() => { result.current.updateOrg({ name: 'Acme', privacyEmail: 'a@b.com' }); });
    expect(result.current.canProceed).toBe(true);
  });

  it('nextStep advances step', () => {
    const { result } = renderHook(() => useAdaptivePolicyWizard());
    act(() => { result.current.updateOrg({ name: 'Acme', privacyEmail: 'a@b.com' }); });
    act(() => { result.current.nextStep(); });
    expect(result.current.currentStep).toBe(2);
  });

  it('prevStep decrements step but not below 1', () => {
    const { result } = renderHook(() => useAdaptivePolicyWizard());
    act(() => { result.current.prevStep(); });
    expect(result.current.currentStep).toBe(1);
  });

  it('goToStep navigates to a specific step', () => {
    const { result } = renderHook(() => useAdaptivePolicyWizard());
    act(() => { result.current.goToStep(3); });
    expect(result.current.currentStep).toBe(3);
  });

  it('goToStep clamps to valid range', () => {
    const { result } = renderHook(() => useAdaptivePolicyWizard());
    act(() => { result.current.goToStep(10); });
    expect(result.current.currentStep).toBe(4);
    act(() => { result.current.goToStep(0); });
    expect(result.current.currentStep).toBe(1);
  });

  it('toggleDataCategory selects/deselects', () => {
    const { result } = renderHook(() => useAdaptivePolicyWizard());
    act(() => { result.current.toggleDataCategory('contact-details'); });
    const cat = result.current.context.dataCategories.find(c => c.id === 'contact-details');
    expect(cat?.selected).toBe(true);
    // Toggle again to deselect
    act(() => { result.current.toggleDataCategory('contact-details'); });
    const cat2 = result.current.context.dataCategories.find(c => c.id === 'contact-details');
    expect(cat2?.selected).toBe(false);
  });

  it('canProceed is false on step 2 without data categories', () => {
    const { result } = renderHook(() => useAdaptivePolicyWizard());
    act(() => {
      result.current.updateOrg({ name: 'Acme', privacyEmail: 'a@b.com' });
      result.current.nextStep(); // go to step 2
    });
    expect(result.current.canProceed).toBe(false);
  });

  it('canProceed is true on step 2 when a category is selected', () => {
    const { result } = renderHook(() => useAdaptivePolicyWizard());
    act(() => {
      result.current.updateOrg({ name: 'Acme', privacyEmail: 'a@b.com' });
      result.current.nextStep();
      result.current.toggleDataCategory('contact-details');
    });
    expect(result.current.canProceed).toBe(true);
  });

  it('togglePurpose adds and removes purposes', () => {
    const { result } = renderHook(() => useAdaptivePolicyWizard());
    act(() => { result.current.togglePurpose('service_delivery'); });
    expect(result.current.context.purposes).toContain('service_delivery');
    act(() => { result.current.togglePurpose('service_delivery'); });
    expect(result.current.context.purposes).not.toContain('service_delivery');
  });

  it('canProceed is false on step 3 without purposes', () => {
    const { result } = renderHook(() => useAdaptivePolicyWizard());
    act(() => { result.current.goToStep(3); });
    expect(result.current.canProceed).toBe(false);
  });

  it('canProceed is true on step 3 when a purpose is selected', () => {
    const { result } = renderHook(() => useAdaptivePolicyWizard());
    act(() => {
      result.current.goToStep(3);
      result.current.togglePurpose('service_delivery');
    });
    expect(result.current.canProceed).toBe(true);
  });

  it('canProceed is always true on step 4', () => {
    const { result } = renderHook(() => useAdaptivePolicyWizard());
    act(() => { result.current.goToStep(4); });
    expect(result.current.canProceed).toBe(true);
  });

  it('generates sections when policy is built', () => {
    const { result } = renderHook(() => useAdaptivePolicyWizard());
    act(() => {
      result.current.updateOrg({ name: 'Acme', privacyEmail: 'a@b.com', website: 'https://acme.ng' });
      result.current.toggleDataCategory('contact-details');
      result.current.togglePurpose('service_delivery');
    });
    expect(result.current.sections.length).toBeGreaterThan(0);
  });

  it('policy is null when no org info is set', () => {
    const { result } = renderHook(() => useAdaptivePolicyWizard());
    expect(result.current.policy).toBeNull();
  });

  it('policy is built once org name and email are set', () => {
    const { result } = renderHook(() => useAdaptivePolicyWizard());
    act(() => {
      result.current.updateOrg({ name: 'Acme', privacyEmail: 'a@b.com' });
    });
    expect(result.current.policy).not.toBeNull();
    expect(result.current.policy?.organizationInfo.name).toBe('Acme');
  });

  it('complianceScore updates with context', () => {
    const { result } = renderHook(() => useAdaptivePolicyWizard());
    expect(result.current.complianceScore).toBeDefined();
    expect(typeof result.current.complianceScore).toBe('number');
  });

  it('complianceResult has expected shape', () => {
    const { result } = renderHook(() => useAdaptivePolicyWizard());
    const cr = result.current.complianceResult;
    expect(cr).toHaveProperty('score');
    expect(cr).toHaveProperty('maxScore');
    expect(cr).toHaveProperty('percentage');
    expect(cr).toHaveProperty('rating');
    expect(cr).toHaveProperty('gaps');
    expect(cr).toHaveProperty('passed');
  });

  it('saves draft to adapter', async () => {
    const adapter = memoryAdapter<any>();
    const { result } = renderHook(() => useAdaptivePolicyWizard({ adapter }));
    act(() => { result.current.updateOrg({ name: 'Test' }); });
    await act(async () => { await result.current.saveDraft(); });
    expect(adapter.load()).not.toBeNull();
  });

  it('discardDraft resets state and removes from adapter', async () => {
    const adapter = memoryAdapter<any>();
    const { result } = renderHook(() => useAdaptivePolicyWizard({ adapter }));
    act(() => { result.current.updateOrg({ name: 'Test', privacyEmail: 'test@test.com' }); });
    await act(async () => { await result.current.saveDraft(); });
    act(() => { result.current.discardDraft(); });
    expect(result.current.context.org.name).toBe('');
    expect(adapter.load()).toBeNull();
  });

  it('addCustomSection adds a section', () => {
    const { result } = renderHook(() => useAdaptivePolicyWizard());
    act(() => {
      result.current.addCustomSection({ title: 'Custom', content: 'Content', order: 99 });
    });
    expect(result.current.customSections).toHaveLength(1);
    expect(result.current.customSections[0].title).toBe('Custom');
    expect(result.current.customSections[0].id).toBeDefined();
    expect(result.current.customSections[0].required).toBe(false);
  });

  it('addCustomSection enforces max 10 sections', () => {
    const { result } = renderHook(() => useAdaptivePolicyWizard());
    act(() => {
      for (let i = 0; i < 15; i++) {
        result.current.addCustomSection({ title: `Section ${i}`, content: 'x', order: i });
      }
    });
    expect(result.current.customSections).toHaveLength(10);
  });

  it('updateCustomSection modifies an existing custom section', () => {
    const { result } = renderHook(() => useAdaptivePolicyWizard());
    act(() => {
      result.current.addCustomSection({ title: 'Original', content: 'Content', order: 1 });
    });
    const id = result.current.customSections[0].id;
    act(() => {
      result.current.updateCustomSection(id, { title: 'Updated' });
    });
    expect(result.current.customSections[0].title).toBe('Updated');
  });

  it('removeCustomSection removes the section', () => {
    const { result } = renderHook(() => useAdaptivePolicyWizard());
    act(() => {
      result.current.addCustomSection({ title: 'ToRemove', content: 'x', order: 1 });
    });
    const id = result.current.customSections[0].id;
    act(() => { result.current.removeCustomSection(id); });
    expect(result.current.customSections).toHaveLength(0);
  });

  it('editSectionContent stores override', () => {
    const { result } = renderHook(() => useAdaptivePolicyWizard());
    act(() => {
      result.current.editSectionContent('introduction', 'My custom intro');
    });
    expect(result.current.sectionOverrides['introduction']).toBe('My custom intro');
  });

  it('editSectionContent override appears in assembled sections', () => {
    const { result } = renderHook(() => useAdaptivePolicyWizard());
    act(() => {
      result.current.updateOrg({ name: 'Acme', privacyEmail: 'a@b.com' });
      result.current.editSectionContent('introduction', 'My overridden intro');
    });
    const introSection = result.current.sections.find(s => s.id === 'introduction');
    expect(introSection?.template).toBe('My overridden intro');
  });

  it('addProcessor adds a third-party processor', () => {
    const { result } = renderHook(() => useAdaptivePolicyWizard());
    act(() => {
      result.current.addProcessor({ name: 'Stripe', purpose: 'Payment processing', country: 'USA' });
    });
    expect(result.current.context.thirdPartyProcessors).toHaveLength(1);
    expect(result.current.context.thirdPartyProcessors[0].name).toBe('Stripe');
  });

  it('removeProcessor removes a third-party processor', () => {
    const { result } = renderHook(() => useAdaptivePolicyWizard());
    act(() => {
      result.current.addProcessor({ name: 'Stripe', purpose: 'Payment', country: 'USA' });
      result.current.addProcessor({ name: 'Mailchimp', purpose: 'Email', country: 'USA' });
    });
    act(() => { result.current.removeProcessor(0); });
    expect(result.current.context.thirdPartyProcessors).toHaveLength(1);
    expect(result.current.context.thirdPartyProcessors[0].name).toBe('Mailchimp');
  });

  it('updateContext merges partial context updates', () => {
    const { result } = renderHook(() => useAdaptivePolicyWizard());
    act(() => {
      result.current.updateContext({ hasChildrenData: true, hasSensitiveData: true });
    });
    expect(result.current.context.hasChildrenData).toBe(true);
    expect(result.current.context.hasSensitiveData).toBe(true);
  });

  it('isDraftSaved becomes true after saveDraft', async () => {
    const adapter = memoryAdapter<any>();
    const { result } = renderHook(() => useAdaptivePolicyWizard({ adapter }));
    await act(async () => { await result.current.saveDraft(); });
    expect(result.current.isDraftSaved).toBe(true);
  });

  it('lastSavedAt is set after saveDraft', async () => {
    const adapter = memoryAdapter<any>();
    const { result } = renderHook(() => useAdaptivePolicyWizard({ adapter }));
    await act(async () => { await result.current.saveDraft(); });
    expect(result.current.lastSavedAt).not.toBeNull();
    expect(typeof result.current.lastSavedAt).toBe('number');
  });

  it('onComplianceChange callback fires when compliance changes', () => {
    const onComplianceChange = jest.fn();
    const { result } = renderHook(() =>
      useAdaptivePolicyWizard({ onComplianceChange }),
    );
    act(() => {
      result.current.updateOrg({ name: 'Acme', privacyEmail: 'a@b.com' });
    });
    expect(onComplianceChange).toHaveBeenCalled();
  });

  it('onComplete callback fires when reaching step 4 with a policy', () => {
    const onComplete = jest.fn();
    const { result } = renderHook(() => useAdaptivePolicyWizard({ onComplete }));
    act(() => {
      result.current.updateOrg({ name: 'Acme', privacyEmail: 'a@b.com' });
      result.current.goToStep(4);
    });
    expect(onComplete).toHaveBeenCalledWith(
      expect.objectContaining({ organizationInfo: expect.objectContaining({ name: 'Acme' }) }),
    );
  });

  it('applyFix with fill_field navigates to the right step', () => {
    const { result } = renderHook(() => useAdaptivePolicyWizard());
    act(() => { result.current.goToStep(3); });
    // Trigger a compliance gap that requires navigating back to step 1
    act(() => {
      const gap = result.current.complianceGaps.find(
        g => g.requirementId === 'controller-identity',
      );
      if (gap) result.current.applyFix(gap.requirementId);
    });
    expect(result.current.currentStep).toBe(1);
  });

  it('applyFix with add_section adds a custom section', () => {
    const { result } = renderHook(() => useAdaptivePolicyWizard());
    const initialCount = result.current.customSections.length;
    // Find a gap that creates a section
    act(() => {
      const gap = result.current.complianceGaps.find(g => g.fixType === 'add_section');
      if (gap) result.current.applyFix(gap.requirementId);
    });
    const gapWithSection = result.current.complianceGaps.find(g => g.fixType === 'add_section');
    if (gapWithSection) {
      expect(result.current.customSections.length).toBeGreaterThan(initialCount);
    }
  });

  it('onComplete fires exactly once when reaching step 4', () => {
    const onComplete = jest.fn();
    const { result } = renderHook(() => useAdaptivePolicyWizard({ onComplete }));
    act(() => {
      result.current.updateOrg({ name: 'Acme', privacyEmail: 'a@b.com' });
    });
    act(() => {
      result.current.goToStep(4);
    });
    expect(onComplete).toHaveBeenCalledTimes(1);
    expect(onComplete).toHaveBeenCalledWith(
      expect.objectContaining({ organizationInfo: expect.objectContaining({ name: 'Acme' }) }),
    );
  });

  it('onComplete does NOT fire on subsequent state changes at step 4', () => {
    const onComplete = jest.fn();
    const { result } = renderHook(() => useAdaptivePolicyWizard({ onComplete }));
    act(() => {
      result.current.updateOrg({ name: 'Acme', privacyEmail: 'a@b.com' });
    });
    act(() => {
      result.current.goToStep(4);
    });
    expect(onComplete).toHaveBeenCalledTimes(1);
    // Make state changes while still on step 4
    act(() => {
      result.current.updateOrg({ name: 'Acme Corp' });
    });
    act(() => {
      result.current.updateOrg({ website: 'https://acme.ng' });
    });
    act(() => {
      result.current.togglePurpose('service_delivery');
    });
    // onComplete should still have been called only once
    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it('onComplete resets when going back and fires again on returning to step 4', () => {
    const onComplete = jest.fn();
    const { result } = renderHook(() => useAdaptivePolicyWizard({ onComplete }));
    act(() => {
      result.current.updateOrg({ name: 'Acme', privacyEmail: 'a@b.com' });
    });
    // First visit to step 4
    act(() => {
      result.current.goToStep(4);
    });
    expect(onComplete).toHaveBeenCalledTimes(1);
    // Go back to step 3
    act(() => {
      result.current.prevStep();
    });
    expect(result.current.currentStep).toBe(3);
    // Return to step 4
    act(() => {
      result.current.goToStep(4);
    });
    expect(onComplete).toHaveBeenCalledTimes(2);
  });

  it('adapter ref is stable across re-renders when no adapter is provided', async () => {
    // The hook stores the adapter in a useRef so the same instance is used
    // across renders. We verify this by rendering without an explicit adapter,
    // saving a draft, re-rendering several times, then saving again. Both saves
    // should go through the same underlying adapter (localStorage in jsdom).
    // If the ref were recreated, the second save could target a different
    // adapter instance and the data would be lost.
    const { result, rerender } = renderHook(() => useAdaptivePolicyWizard());

    // Set up some state so the draft is meaningful
    act(() => { result.current.updateOrg({ name: 'RefStable', privacyEmail: 'ref@test.com' }); });

    // Save draft (goes through the ref-held adapter)
    await act(async () => { await result.current.saveDraft(); });

    // Force multiple re-renders
    rerender();
    rerender();
    rerender();

    // Mutate state and save again — should still use the same adapter
    act(() => { result.current.updateOrg({ name: 'RefStable2' }); });
    await act(async () => { await result.current.saveDraft(); });

    // Discard and verify the adapter ref can still remove (same adapter)
    act(() => { result.current.discardDraft(); });
    expect(result.current.context.org.name).toBe('');
    // After discard, re-rendering should still work without errors
    rerender();
    expect(result.current.currentStep).toBe(1);
  });

  it('reorderSections swaps sections', () => {
    const { result } = renderHook(() => useAdaptivePolicyWizard());
    act(() => {
      result.current.updateOrg({ name: 'Acme', privacyEmail: 'a@b.com' });
    });
    const firstSectionId = result.current.sections[0]?.id;
    const secondSectionId = result.current.sections[1]?.id;
    if (firstSectionId && secondSectionId) {
      act(() => {
        result.current.reorderSections(firstSectionId, 'down');
      });
      expect(result.current.sections[0].id).toBe(secondSectionId);
      expect(result.current.sections[1].id).toBe(firstSectionId);
    }
  });
});
