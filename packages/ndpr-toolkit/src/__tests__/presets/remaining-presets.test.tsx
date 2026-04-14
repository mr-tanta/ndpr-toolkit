import React from 'react';
import { render } from '@testing-library/react';
import {
  NDPRSubjectRights,
  NDPRBreachReport,
  NDPRPrivacyPolicy,
  NDPRDPIA,
  NDPRLawfulBasis,
  NDPRCrossBorder,
  NDPRROPA,
} from '../../presets';

describe('Zero-config presets', () => {
  it('NDPRSubjectRights renders with zero props', () => {
    expect(() => render(<NDPRSubjectRights />)).not.toThrow();
  });

  it('NDPRBreachReport renders with zero props', () => {
    expect(() => render(<NDPRBreachReport />)).not.toThrow();
  });

  it('NDPRPrivacyPolicy renders with zero props', () => {
    expect(() => render(<NDPRPrivacyPolicy />)).not.toThrow();
  });

  it('NDPRDPIA renders with zero props', () => {
    expect(() => render(<NDPRDPIA />)).not.toThrow();
  });

  it('NDPRLawfulBasis renders with zero props', () => {
    expect(() => render(<NDPRLawfulBasis />)).not.toThrow();
  });

  it('NDPRCrossBorder renders with zero props', () => {
    expect(() => render(<NDPRCrossBorder />)).not.toThrow();
  });

  it('NDPRROPA renders with zero props', () => {
    expect(() => render(<NDPRROPA />)).not.toThrow();
  });
});
