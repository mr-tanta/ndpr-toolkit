import React from 'react';
import { render } from '@testing-library/react';
import { useComplianceAuditReturn } from '../../hooks/useComplianceAuditReturn';
import type { ComplianceAuditReturn, CARInput, CAROptions } from '../../utils/car';

function capture(input: CARInput, options?: CAROptions): ComplianceAuditReturn {
  let result: ComplianceAuditReturn | undefined;
  function Probe() {
    result = useComplianceAuditReturn(input, options);
    return null;
  }
  render(<Probe />);
  return result as ComplianceAuditReturn;
}

describe('useComplianceAuditReturn', () => {
  it('returns the CAR schedule for a DCPMI', () => {
    const r = capture({ commencementDate: '2025-01-15', asOf: '2025-06-01', tier: 'UHL' });
    expect(r.applicable).toBe(true);
    expect(r.schedule.initialAuditDueDate).toBe('2026-04-15');
  });

  it('marks a non-DCPMI organisation as not applicable', () => {
    expect(capture({ commencementDate: '2024-01-01', asOf: '2026-01-01', tier: 'none' }).applicable).toBe(false);
  });
});
