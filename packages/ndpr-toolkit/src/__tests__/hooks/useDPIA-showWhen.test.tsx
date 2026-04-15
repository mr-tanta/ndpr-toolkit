import React from 'react';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useDPIA } from '../../hooks/useDPIA';
import { memoryAdapter } from '../../adapters/memory';
import type { DPIASection } from '../../types/dpia';

/**
 * Tests for the fix ensuring `isComplete` uses the same `.every()` visibility
 * logic as `shouldShowQuestion`. Previously `isComplete` used `.some()` for
 * showWhen conditions while `shouldShowQuestion` used `.every()`, causing a
 * mismatch: a conditionally-hidden question could still block completion.
 */

// Helper: build sections with conditional questions that require BOTH conditions
function buildSectionsWithMultiCondition(): DPIASection[] {
  return [
    {
      id: 'section1',
      title: 'Base questions',
      description: 'Trigger questions',
      order: 1,
      questions: [
        {
          id: 'q1',
          text: 'Do you process sensitive data?',
          type: 'radio',
          required: true,
          options: [
            { value: 'yes', label: 'Yes' },
            { value: 'no', label: 'No' },
          ],
        },
        {
          id: 'q2',
          text: 'Is it cross-border?',
          type: 'radio',
          required: true,
          options: [
            { value: 'yes', label: 'Yes' },
            { value: 'no', label: 'No' },
          ],
        },
        {
          id: 'q3',
          text: 'Describe the safeguards in place',
          type: 'textarea',
          required: true,
          showWhen: [
            { questionId: 'q1', operator: 'equals', value: 'yes' },
            { questionId: 'q2', operator: 'equals', value: 'yes' },
          ],
        },
      ],
    },
  ];
}

function createAdapter() {
  return memoryAdapter<Record<string, any>>();
}

describe('useDPIA showWhen visibility and isComplete consistency', () => {
  // ---- Core fix tests ----

  it('shouldShowQuestion returns false when only ONE of two showWhen conditions is met', async () => {
    const adapter = createAdapter();
    const sections = buildSectionsWithMultiCondition();

    const { result } = renderHook(() =>
      useDPIA({ sections, adapter, initialAnswers: { q1: 'yes', q2: 'no' } })
    );
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    // q3 requires BOTH q1=yes AND q2=yes; only q1 is yes
    const visible = result.current.getVisibleQuestions();
    const q3Visible = visible.some((q) => q.id === 'q3');
    expect(q3Visible).toBe(false);
  });

  it('isComplete does NOT require an answer to a hidden question (partial showWhen match)', async () => {
    const adapter = createAdapter();
    const sections = buildSectionsWithMultiCondition();

    // Answer q1 and q2 but NOT q3 - q3 is hidden because q2=no
    const { result } = renderHook(() =>
      useDPIA({ sections, adapter, initialAnswers: { q1: 'yes', q2: 'no' } })
    );
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    // q3 is hidden so isComplete should be true even without q3 answered
    expect(result.current.isComplete()).toBe(true);
  });

  it('shows question and requires it for completion when ALL showWhen conditions are met', async () => {
    const adapter = createAdapter();
    const sections = buildSectionsWithMultiCondition();

    // Both conditions met, but q3 not answered
    const { result } = renderHook(() =>
      useDPIA({ sections, adapter, initialAnswers: { q1: 'yes', q2: 'yes' } })
    );
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    // q3 should be visible
    const visible = result.current.getVisibleQuestions();
    const q3Visible = visible.some((q) => q.id === 'q3');
    expect(q3Visible).toBe(true);

    // isComplete should be false because q3 is visible, required, and unanswered
    expect(result.current.isComplete()).toBe(false);
  });

  it('isComplete returns true when ALL conditions met AND the conditional question is answered', async () => {
    const adapter = createAdapter();
    const sections = buildSectionsWithMultiCondition();

    const { result } = renderHook(() =>
      useDPIA({
        sections,
        adapter,
        initialAnswers: { q1: 'yes', q2: 'yes', q3: 'We use encryption' },
      })
    );
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.isComplete()).toBe(true);
  });

  // ---- Visibility transitions via updateAnswer ----

  it('question becomes visible when second condition is toggled to true', async () => {
    const adapter = createAdapter();
    const sections = buildSectionsWithMultiCondition();

    const { result } = renderHook(() =>
      useDPIA({ sections, adapter, initialAnswers: { q1: 'yes', q2: 'no' } })
    );
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    // Initially hidden
    expect(result.current.getVisibleQuestions().some((q) => q.id === 'q3')).toBe(false);
    expect(result.current.isComplete()).toBe(true);

    // Toggle q2 to 'yes'
    act(() => {
      result.current.updateAnswer('q2', 'yes');
    });

    // Now q3 should be visible and required
    expect(result.current.getVisibleQuestions().some((q) => q.id === 'q3')).toBe(true);
    expect(result.current.isComplete()).toBe(false);

    // Answer q3
    act(() => {
      result.current.updateAnswer('q3', 'Safeguards described');
    });

    expect(result.current.isComplete()).toBe(true);
  });

  // ---- Edge cases ----

  it('question with empty showWhen array is always visible', async () => {
    const adapter = createAdapter();
    const sections: DPIASection[] = [
      {
        id: 'section1',
        title: 'Test section',
        description: '',
        order: 1,
        questions: [
          {
            id: 'q_empty_showWhen',
            text: 'Always visible question',
            type: 'text',
            required: true,
            showWhen: [],
          },
        ],
      },
    ];

    const { result } = renderHook(() => useDPIA({ sections, adapter }));
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    // Empty showWhen -> .every() on empty array returns true -> visible
    const visible = result.current.getVisibleQuestions();
    expect(visible.some((q) => q.id === 'q_empty_showWhen')).toBe(true);

    // Required and unanswered, so isComplete should be false
    expect(result.current.isComplete()).toBe(false);
  });

  it('question with no showWhen property is always visible', async () => {
    const adapter = createAdapter();
    const sections: DPIASection[] = [
      {
        id: 'section1',
        title: 'Test section',
        description: '',
        order: 1,
        questions: [
          {
            id: 'q_no_showWhen',
            text: 'Normal question without conditions',
            type: 'text',
            required: true,
          },
        ],
      },
    ];

    const { result } = renderHook(() => useDPIA({ sections, adapter }));
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    const visible = result.current.getVisibleQuestions();
    expect(visible.some((q) => q.id === 'q_no_showWhen')).toBe(true);

    // Required and unanswered
    expect(result.current.isComplete()).toBe(false);

    // Answer it
    act(() => {
      result.current.updateAnswer('q_no_showWhen', 'An answer');
    });

    expect(result.current.isComplete()).toBe(true);
  });

  // ---- Progress consistency ----

  it('progress excludes hidden conditional questions from the total', async () => {
    const adapter = createAdapter();
    const sections = buildSectionsWithMultiCondition();

    // q3 is hidden (q2=no), so only q1 and q2 count
    const { result } = renderHook(() =>
      useDPIA({ sections, adapter, initialAnswers: { q1: 'yes', q2: 'no' } })
    );
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    // Both visible required questions answered -> 100%
    expect(result.current.progress).toBe(100);
  });

  it('progress includes conditional question once it becomes visible', async () => {
    const adapter = createAdapter();
    const sections = buildSectionsWithMultiCondition();

    // q3 is visible (both conditions met) but unanswered
    const { result } = renderHook(() =>
      useDPIA({ sections, adapter, initialAnswers: { q1: 'yes', q2: 'yes' } })
    );
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    // 2 out of 3 required visible questions answered -> ~67%
    expect(result.current.progress).toBe(67);
  });

  // ---- Section validation consistency ----

  it('isCurrentSectionValid treats hidden questions as valid (not required)', async () => {
    const adapter = createAdapter();
    const sections = buildSectionsWithMultiCondition();

    // q3 hidden, q1 and q2 answered
    const { result } = renderHook(() =>
      useDPIA({ sections, adapter, initialAnswers: { q1: 'yes', q2: 'no' } })
    );
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.isCurrentSectionValid()).toBe(true);
  });

  it('isCurrentSectionValid returns false when visible conditional question is unanswered', async () => {
    const adapter = createAdapter();
    const sections = buildSectionsWithMultiCondition();

    // q3 visible but unanswered
    const { result } = renderHook(() =>
      useDPIA({ sections, adapter, initialAnswers: { q1: 'yes', q2: 'yes' } })
    );
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.isCurrentSectionValid()).toBe(false);
  });
});
