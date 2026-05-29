import React from 'react';
import { render } from '@testing-library/react';
import { useDCPMI } from '../../hooks/useDCPMI';
import type {
  DCPMIClassification,
  DCPMIInput,
  DCPMIClassificationOptions,
} from '../../utils/dcpmi';

function capture(input: DCPMIInput, options?: DCPMIClassificationOptions): DCPMIClassification {
  let result: DCPMIClassification | undefined;
  function Probe() {
    result = useDCPMI(input, options);
    return null;
  }
  render(<Probe />);
  return result as DCPMIClassification;
}

describe('useDCPMI', () => {
  it('returns the DCPMI classification for the given input', () => {
    const r = capture({ dataSubjectsInSixMonths: 6000 });
    expect(r.tier).toBe('UHL');
    expect(r.annualFeeNGN).toBe(250000);
    expect(r.isDCPMI).toBe(true);
  });

  it('reflects custom thresholds', () => {
    const r = capture({ dataSubjectsInSixMonths: 300 }, { thresholds: { ohl: 500, ehl: 1000, uhl: 5000 } });
    expect(r.tier).toBe('none'); // 300 is below the custom OHL threshold of 500
  });
});
