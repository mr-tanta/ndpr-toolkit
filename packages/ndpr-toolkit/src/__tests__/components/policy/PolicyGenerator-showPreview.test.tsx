/**
 * `showPreview` regression suite.
 *
 * The prop was declared on PolicyGeneratorProps and documented as "Whether to
 * show a preview of the generated policy / @default true", but nothing in the
 * component ever read it — so `showPreview={false}` silently still showed the
 * preview step. These tests pin the implemented behavior in both directions.
 */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { PolicyGenerator } from '../../../components/policy/PolicyGenerator';
import type { PolicySection, PolicyVariable } from '../../../types/privacy';

const sections: PolicySection[] = [
  {
    id: 'intro',
    title: 'Introduction',
    content: '',
    template: 'We are {{orgName}}.',
    required: true,
    included: true,
    order: 1,
  },
];

// `value` is already populated so validateVariables passes and the generate
// button is reachable without filling the form.
const variables: PolicyVariable[] = [
  {
    id: 'orgName',
    name: 'orgName',
    description: 'Organisation name',
    value: 'Tanta Innovative',
    required: true,
    type: 'text',
  } as PolicyVariable,
];

/** Walk the wizard from the sections step to the variables step. */
function goToVariables() {
  fireEvent.click(screen.getByRole('button', { name: /continue|next|variables/i }));
}

describe('PolicyGenerator — showPreview', () => {
  it('defaults to true: generating lands on the preview step and waits for Save', () => {
    const onGenerate = jest.fn();
    render(
      <PolicyGenerator sections={sections} variables={variables} onGenerate={onGenerate} />,
    );

    expect(screen.getByText('Preview')).toBeInTheDocument();

    goToVariables();
    fireEvent.click(screen.getByRole('button', { name: /generate policy/i }));

    // Preview is shown and nothing is emitted until the user confirms.
    expect(screen.getByRole('heading', { name: /preview generated policy/i })).toBeInTheDocument();
    expect(onGenerate).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole('button', { name: /save policy/i }));
    expect(onGenerate).toHaveBeenCalledTimes(1);
  });

  it('showPreview={false}: generating emits immediately and skips the preview step', () => {
    const onGenerate = jest.fn();
    render(
      <PolicyGenerator
        sections={sections}
        variables={variables}
        showPreview={false}
        onGenerate={onGenerate}
      />,
    );

    // The step indicator drops the third step entirely.
    expect(screen.queryByText('Preview')).not.toBeInTheDocument();

    goToVariables();
    fireEvent.click(screen.getByRole('button', { name: /generate policy/i }));

    expect(onGenerate).toHaveBeenCalledTimes(1);
    expect(
      screen.queryByRole('heading', { name: /preview generated policy/i }),
    ).not.toBeInTheDocument();
  });

  it('showPreview={false}: emits the freshly generated content, not stale state', () => {
    // generatePolicy calls onGenerate in the same tick as setGeneratedPolicy, so
    // reading component state there would submit the previous (empty) value.
    // The implementation passes the local policyContent instead.
    const onGenerate = jest.fn();
    render(
      <PolicyGenerator
        sections={sections}
        variables={variables}
        showPreview={false}
        onGenerate={onGenerate}
      />,
    );

    goToVariables();
    fireEvent.click(screen.getByRole('button', { name: /generate policy/i }));

    const payload = onGenerate.mock.calls[0][0];
    expect(payload.content).toContain('## Introduction');
    expect(payload.content).toContain('We are Tanta Innovative.');
    expect(payload.content).not.toBe('');
    expect(payload.sections).toHaveLength(1);
    expect(payload.variables).toHaveLength(1);
  });

  it('showPreview={false} still blocks generation when a required variable is empty', () => {
    const onGenerate = jest.fn();
    render(
      <PolicyGenerator
        sections={sections}
        variables={[{ ...variables[0], value: '' }]}
        showPreview={false}
        onGenerate={onGenerate}
      />,
    );

    goToVariables();
    fireEvent.click(screen.getByRole('button', { name: /generate policy/i }));

    expect(onGenerate).not.toHaveBeenCalled();
    expect(screen.getByText(/orgName is required/i)).toBeInTheDocument();
  });
});
