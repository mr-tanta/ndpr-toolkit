import {
  validateTransfer,
  getTransferMechanismDescription,
  assessTransferRisk,
  isNDPCApprovalRequired,
} from '../../utils/cross-border';
import { CrossBorderTransfer, TransferMechanism } from '../../types/cross-border';

const createValidTransfer = (overrides: Partial<CrossBorderTransfer> = {}): CrossBorderTransfer => ({
  id: 'xfer-001',
  destinationCountry: 'United Kingdom',
  destinationCountryCode: 'GB',
  adequacyStatus: 'adequate',
  transferMechanism: 'adequacy_decision',
  dataCategories: ['name', 'email', 'transaction history'],
  includesSensitiveData: false,
  estimatedDataSubjects: 500,
  recipientOrganization: 'Acme UK Ltd',
  recipientContact: {
    name: 'Jane Williams',
    email: 'jane.williams@acme-uk.example.com',
    phone: '+44 20 7123 4567',
    address: '10 King Street, London, EC2V 8AA',
  },
  purpose: 'Fulfillment of customer orders placed through the UK portal',
  safeguards: ['TLS 1.3 encryption in transit', 'AES-256 encryption at rest', 'role-based access controls'],
  riskAssessment: 'Low risk — UK has an adequate level of data protection recognized by the NDPC.',
  riskLevel: 'low',
  tiaCompleted: true,
  tiaReference: 'TIA-2025-001',
  frequency: 'periodic',
  startDate: Date.now() - 86400000 * 90,
  endDate: undefined,
  status: 'active',
  createdAt: Date.now() - 86400000 * 90,
  updatedAt: Date.now(),
  reviewDate: Date.now() + 86400000 * 180,
  ...overrides,
});

describe('isNDPCApprovalRequired', () => {
  it('should require approval for standard_clauses', () => {
    expect(isNDPCApprovalRequired('standard_clauses')).toBe(true);
  });

  it('should require approval for binding_corporate_rules', () => {
    expect(isNDPCApprovalRequired('binding_corporate_rules')).toBe(true);
  });

  it('should require approval for ndpc_authorization', () => {
    expect(isNDPCApprovalRequired('ndpc_authorization')).toBe(true);
  });

  it('should not require approval for adequacy_decision', () => {
    expect(isNDPCApprovalRequired('adequacy_decision')).toBe(false);
  });

  it('should not require approval for explicit_consent', () => {
    expect(isNDPCApprovalRequired('explicit_consent')).toBe(false);
  });

  it('should not require approval for contract_performance', () => {
    expect(isNDPCApprovalRequired('contract_performance')).toBe(false);
  });

  it('should not require approval for public_interest', () => {
    expect(isNDPCApprovalRequired('public_interest')).toBe(false);
  });

  it('should not require approval for legal_claims', () => {
    expect(isNDPCApprovalRequired('legal_claims')).toBe(false);
  });

  it('should not require approval for vital_interests', () => {
    expect(isNDPCApprovalRequired('vital_interests')).toBe(false);
  });
});

describe('getTransferMechanismDescription', () => {
  const mechanisms: TransferMechanism[] = [
    'adequacy_decision',
    'standard_clauses',
    'binding_corporate_rules',
    'ndpc_authorization',
    'explicit_consent',
    'contract_performance',
    'public_interest',
    'legal_claims',
    'vital_interests',
  ];

  it.each(mechanisms)('should return a non-empty description for "%s"', (mechanism) => {
    const description = getTransferMechanismDescription(mechanism);

    expect(typeof description).toBe('string');
    expect(description.length).toBeGreaterThan(0);
  });

  it('should reference NDPA Section 41 for adequacy_decision', () => {
    const description = getTransferMechanismDescription('adequacy_decision');

    expect(description).toContain('NDPA Section 41');
    expect(description).toContain('Adequacy Decision');
  });

  it('should reference NDPA Section 42 for standard_clauses', () => {
    const description = getTransferMechanismDescription('standard_clauses');

    expect(description).toContain('NDPA Section 42');
    expect(description).toContain('Standard Contractual Clauses');
  });

  it('should reference NDPA Section 43 for binding_corporate_rules', () => {
    const description = getTransferMechanismDescription('binding_corporate_rules');

    expect(description).toContain('NDPA Section 43');
    expect(description).toContain('Binding Corporate Rules');
  });

  it('should reference NDPA Section 44 for ndpc_authorization', () => {
    const description = getTransferMechanismDescription('ndpc_authorization');

    expect(description).toContain('NDPA Section 44');
  });

  it('should reference NDPA Section 45 derogations for explicit_consent', () => {
    const description = getTransferMechanismDescription('explicit_consent');

    expect(description).toContain('NDPA Section 45(a)');
    expect(description).toContain('Explicit Consent');
  });

  it('should reference NDPA Section 45 derogations for vital_interests', () => {
    const description = getTransferMechanismDescription('vital_interests');

    expect(description).toContain('NDPA Section 45(e)');
    expect(description).toContain('Vital Interests');
  });
});

describe('validateTransfer', () => {
  it('should validate a fully compliant transfer', () => {
    const transfer = createValidTransfer();
    const result = validateTransfer(transfer);

    expect(result.isValid).toBe(true);
    expect(result.errors).toEqual([]);
  });

  it('should return errors for missing required fields', () => {
    const transfer = createValidTransfer({
      id: '',
      destinationCountry: '',
      recipientOrganization: '',
      recipientContact: { name: '', email: '' },
      purpose: '',
      transferMechanism: undefined as unknown as TransferMechanism,
      dataCategories: [],
      riskAssessment: '',
      safeguards: [],
    });

    const result = validateTransfer(transfer);

    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Transfer ID is required.');
    expect(result.errors).toContain('Destination country is required.');
    expect(result.errors).toContain('Recipient organization is required.');
    expect(result.errors).toContain('Recipient contact name is required.');
    expect(result.errors).toContain('Recipient contact email is required.');
    expect(result.errors).toContain('Purpose of the transfer is required.');
    expect(result.errors).toContain('At least one data category must be specified.');
    expect(result.errors).toContain('Risk assessment summary is required.');
    expect(result.errors).toContain('At least one safeguard must be documented for the transfer.');
  });

  it('should require NDPC approval documentation for standard_clauses', () => {
    const transfer = createValidTransfer({
      transferMechanism: 'standard_clauses',
      ndpcApproval: undefined,
    });

    const result = validateTransfer(transfer);

    expect(result.isValid).toBe(false);
    expect(result.errors).toContain(
      'NDPC approval documentation is required for transfers using Standard Contractual Clauses.'
    );
  });

  it('should require NDPC approval documentation for binding_corporate_rules', () => {
    const transfer = createValidTransfer({
      transferMechanism: 'binding_corporate_rules',
      ndpcApproval: undefined,
    });

    const result = validateTransfer(transfer);

    expect(result.isValid).toBe(false);
    expect(result.errors).toContain(
      'NDPC approval documentation is required for transfers using Binding Corporate Rules.'
    );
  });

  it('should error when NDPC approval is required but not applied', () => {
    const transfer = createValidTransfer({
      transferMechanism: 'standard_clauses',
      ndpcApproval: {
        required: true,
        applied: false,
      },
    });

    const result = validateTransfer(transfer);

    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('NDPC approval is required but an application has not been submitted.');
  });

  it('should error when transfer is active but NDPC approval not yet granted', () => {
    const transfer = createValidTransfer({
      transferMechanism: 'ndpc_authorization',
      status: 'active',
      ndpcApproval: {
        required: true,
        applied: true,
        approved: false,
      },
    });

    const result = validateTransfer(transfer);

    expect(result.isValid).toBe(false);
    expect(result.errors).toContain(
      'Transfer is marked as active but NDPC approval has not been granted. Status should be "pending_approval".'
    );
  });

  it('should pass when NDPC approval is properly documented and granted', () => {
    const transfer = createValidTransfer({
      transferMechanism: 'standard_clauses',
      ndpcApproval: {
        required: true,
        applied: true,
        approved: true,
        referenceNumber: 'NDPC-2025-XF-001',
        appliedAt: Date.now() - 86400000 * 30,
        approvedAt: Date.now() - 86400000 * 7,
      },
    });

    const result = validateTransfer(transfer);

    expect(result.isValid).toBe(true);
  });

  it('should error when relying on adequacy_decision but destination is inadequate', () => {
    const transfer = createValidTransfer({
      transferMechanism: 'adequacy_decision',
      adequacyStatus: 'inadequate',
    });

    const result = validateTransfer(transfer);

    expect(result.isValid).toBe(false);
    expect(result.errors).toContain(
      'Cannot rely on adequacy decision (Section 41) when the destination country is marked as inadequate.'
    );
  });

  it('should error when start date is after end date', () => {
    const transfer = createValidTransfer({
      startDate: Date.now(),
      endDate: Date.now() - 86400000 * 30,
    });

    const result = validateTransfer(transfer);

    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Start date must be before end date.');
  });

  it('should warn when TIA has not been completed', () => {
    const transfer = createValidTransfer({
      tiaCompleted: false,
    });

    const result = validateTransfer(transfer);

    expect(result.warnings).toContain(
      'A Transfer Impact Assessment (TIA) has not been completed for this transfer.'
    );
  });

  it('should warn when sensitive data is included but risk level is not high', () => {
    const transfer = createValidTransfer({
      includesSensitiveData: true,
      riskLevel: 'medium',
    });

    const result = validateTransfer(transfer);

    expect(result.warnings).toContain(
      'Transfer includes sensitive personal data but the risk level is not set to high. Consider reviewing the risk assessment.'
    );
  });

  it('should warn when no review date is set', () => {
    const transfer = createValidTransfer({
      reviewDate: undefined,
    });

    const result = validateTransfer(transfer);

    expect(result.warnings).toContain(
      'No review date has been set for this transfer. Periodic reviews are recommended.'
    );
  });
});

describe('assessTransferRisk', () => {
  it('should return low risk for an adequate destination with strong mechanism', () => {
    const transfer = createValidTransfer({
      adequacyStatus: 'adequate',
      transferMechanism: 'adequacy_decision',
      includesSensitiveData: false,
      estimatedDataSubjects: 100,
      tiaCompleted: true,
      frequency: 'periodic',
      safeguards: ['encryption', 'access controls', 'contractual clauses'],
    });

    const result = assessTransferRisk(transfer);

    expect(result.riskLevel).toBe('low');
    expect(result.riskScore).toBeLessThanOrEqual(4);
  });

  it('should increase risk for inadequate destination', () => {
    const transfer = createValidTransfer({
      adequacyStatus: 'inadequate',
      transferMechanism: 'standard_clauses',
      includesSensitiveData: false,
      estimatedDataSubjects: 100,
      tiaCompleted: true,
      ndpcApproval: { required: true, applied: true, approved: true },
      safeguards: ['encryption', 'access controls', 'contractual clauses'],
      frequency: 'periodic',
    });

    const result = assessTransferRisk(transfer);

    expect(result.factors).toContain(
      'Destination country does not have an adequate level of data protection.'
    );
    expect(result.recommendations).toContain(
      'Implement supplementary technical and organizational measures.'
    );
  });

  it('should increase risk for sensitive data', () => {
    const transfer = createValidTransfer({
      includesSensitiveData: true,
    });

    const result = assessTransferRisk(transfer);

    expect(result.factors).toContain(
      'Transfer includes sensitive personal data, increasing the potential impact of unauthorized access.'
    );
    expect(result.recommendations).toContain(
      'Ensure encryption in transit and at rest, and apply strict access controls.'
    );
  });

  it('should increase risk for large numbers of data subjects', () => {
    const transfer = createValidTransfer({
      estimatedDataSubjects: 50000,
    });

    const result = assessTransferRisk(transfer);

    expect(result.factors).toContain(
      'Large number of data subjects involved increases the scope of potential harm.'
    );
  });

  it('should flag moderate number of data subjects', () => {
    const transfer = createValidTransfer({
      estimatedDataSubjects: 5000,
    });

    const result = assessTransferRisk(transfer);

    expect(result.factors).toContain('Moderate number of data subjects involved.');
  });

  it('should increase risk when TIA is not completed', () => {
    const transfer = createValidTransfer({
      tiaCompleted: false,
    });

    const result = assessTransferRisk(transfer);

    expect(result.factors).toContain('Transfer Impact Assessment has not been completed.');
    expect(result.recommendations).toContain(
      'Complete a Transfer Impact Assessment before proceeding with the transfer.'
    );
  });

  it('should increase risk for continuous transfers', () => {
    const transfer = createValidTransfer({
      frequency: 'continuous',
    });

    const result = assessTransferRisk(transfer);

    expect(result.factors).toContain('Continuous data transfer increases exposure window.');
  });

  it('should increase risk when NDPC approval is required but not granted', () => {
    const transfer = createValidTransfer({
      transferMechanism: 'standard_clauses',
      ndpcApproval: {
        required: true,
        applied: true,
        approved: false,
      },
    });

    const result = assessTransferRisk(transfer);

    expect(result.factors).toContain('NDPC approval is required but has not been granted.');
    expect(result.recommendations).toContain('Obtain NDPC approval before activating the transfer.');
  });

  it('should increase risk for limited safeguards', () => {
    const transfer = createValidTransfer({
      safeguards: ['encryption'],
    });

    const result = assessTransferRisk(transfer);

    expect(result.factors).toContain('Limited number of safeguards documented.');
  });

  it('should return high risk when multiple risk factors accumulate', () => {
    const transfer = createValidTransfer({
      adequacyStatus: 'inadequate',
      transferMechanism: 'vital_interests',
      includesSensitiveData: true,
      estimatedDataSubjects: 50000,
      tiaCompleted: false,
      frequency: 'continuous',
      safeguards: ['basic encryption'],
    });

    const result = assessTransferRisk(transfer);

    expect(result.riskLevel).toBe('high');
    expect(result.riskScore).toBeGreaterThan(9);
    expect(result.factors.length).toBeGreaterThanOrEqual(5);
    expect(result.recommendations.length).toBeGreaterThanOrEqual(3);
  });

  it('should flag derogation mechanisms as weaker safeguards', () => {
    const transfer = createValidTransfer({
      transferMechanism: 'explicit_consent',
    });

    const result = assessTransferRisk(transfer);

    expect(result.factors.some((f) => f.includes('derogation mechanism'))).toBe(true);
  });

  it('should recommend unknown adequacy countries be assessed', () => {
    const transfer = createValidTransfer({
      adequacyStatus: 'unknown',
    });

    const result = assessTransferRisk(transfer);

    expect(result.factors).toContain(
      'Data protection adequacy of the destination country has not been assessed.'
    );
    expect(result.recommendations).toContain(
      'Conduct an adequacy assessment of the destination country.'
    );
  });
});
