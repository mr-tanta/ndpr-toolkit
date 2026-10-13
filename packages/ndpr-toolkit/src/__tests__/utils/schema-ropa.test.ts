import {
  parsePrismaSchema,
  lintSchemaForPersonalData,
  generateRopaFromSchema,
  suggestCategory,
  tokenizeFieldName,
} from '../../utils/schema-ropa';

const SCHEMA = `
generator client {
  provider = "prisma-client-js"
}

/// Customer accounts
/// @ndpr subject=customer purpose=kyc basis=legal_obligation retain=P5Y
model Customer {
  id        String   @id
  /// @ndpr category=identifier.bvn processor=smile-identity
  bvn       String
  /// @ndpr category=contact.phone purpose=account_service basis=contract retain=P2Y
  phoneNumber String
  /// @ndpr none
  internalScore Int
  createdAt DateTime @default(now())
  nextOfKinName String?

  @@map("customers")
}

/// @ndpr subject=patient purpose=care basis=vital_interests retain=P10Y
model Patient {
  id String @id
  /// @ndpr category=sensitive.health
  genotype String
  /// @ndpr category=identity.name subject_class=child decision=automated colour=blue
  childName String
  /// @ndpr category=identity.date_of_birth basis=whim retain=forever
  dateOfBirth DateTime
}
`;

describe('field-name lexicon', () => {
  it('tokenizes camelCase and snake_case', () => {
    expect(tokenizeFieldName('nextOfKin_name')).toEqual(['next', 'of', 'kin', 'name']);
  });
  it('suggests Nigerian categories and skips known non-personal names', () => {
    expect(suggestCategory('customerBvn')?.category).toBe('identifier.bvn');
    expect(suggestCategory('stateOfOrigin')?.category).toBe('identity.state_of_origin');
    expect(suggestCategory('religion')?.sensitive).toBe(true);
    expect(suggestCategory('filename')).toBeUndefined();
    expect(suggestCategory('status')).toBeUndefined();
  });
  it('treats "name" as personal only alone or after a person qualifier', () => {
    expect(suggestCategory('name')?.category).toBe('identity.name');
    expect(suggestCategory('subjectName')?.category).toBe('identity.name');
    expect(suggestCategory('first_name')?.category).toBe('identity.name');
    expect(suggestCategory('projectName')).toBeUndefined();
    expect(suggestCategory('activityName')).toBeUndefined();
  });
});

describe('parsePrismaSchema', () => {
  it('reads models, fields, and model and field annotations', () => {
    const models = parsePrismaSchema(SCHEMA);
    expect(models.map((m) => m.name)).toEqual(['Customer', 'Patient']);
    const customer = models[0];
    expect(customer.annotation).toMatchObject({ subject: 'customer', purpose: 'kyc', basis: 'legal_obligation', retain: 'P5Y' });
    expect(customer.fields.map((f) => f.name)).toEqual(['id', 'bvn', 'phoneNumber', 'internalScore', 'createdAt', 'nextOfKinName']);
    expect(customer.fields[1].annotation).toMatchObject({ category: 'identifier.bvn', processors: ['smile-identity'] });
    expect(customer.fields[3].annotation?.none).toBe(true);
  });
});

describe('lintSchemaForPersonalData', () => {
  const result = lintSchemaForPersonalData(parsePrismaSchema(SCHEMA));
  const codes = (field: string) => result.findings.filter((f) => f.field === field).map((f) => f.code);

  it('fails unannotated personal-looking fields', () => {
    expect(codes('nextOfKinName')).toEqual(['unannotated_personal_field']);
  });

  it('accepts field annotations that inherit model defaults', () => {
    expect(codes('bvn')).toEqual([]);
    expect(codes('phoneNumber')).toEqual([]);
  });

  it('requires an NDPA Section 30 condition for sensitive data', () => {
    expect(codes('genotype')).toContain('missing_sensitive_condition');
  });

  it('flags child data, automated decisions and unknown keys as warnings', () => {
    expect(codes('childName')).toEqual(expect.arrayContaining(['child_data', 'automated_decision', 'unknown_annotation_key']));
  });

  it('rejects invalid bases and retention durations', () => {
    expect(codes('dateOfBirth')).toEqual(expect.arrayContaining(['invalid_basis', 'invalid_retain']));
  });

  it('reports coverage', () => {
    expect(result.coverage).toEqual({ personalFieldsDetected: 6, annotated: 5, markedNotPersonal: 1 });
    expect(result.errors).toBeGreaterThan(0);
  });
});

describe('annotation parsing robustness', () => {
  it('reads quoted values and ignores bare words', () => {
    const [model] = parsePrismaSchema('model A {\n  /// @ndpr category=contact.email purpose="customer support" stray basis=contract\n  email String\n}\n');
    expect(model.fields[0].annotation).toMatchObject({ category: 'contact.email', purpose: 'customer support', basis: 'contract' });
  });

  it('parses adversarial underscore and equals runs in linear time', () => {
    const evil = `model A {\n  /// @ndpr ${'_'.repeat(50000)}x ${'='.repeat(50000)}\n  name String\n}\n`;
    const started = Date.now();
    parsePrismaSchema(evil);
    expect(Date.now() - started).toBeLessThan(500);
  });
});

describe('generateRopaFromSchema', () => {
  it('groups valid annotated fields into asserted drafts and skips invalid ones', () => {
    const drafts = generateRopaFromSchema(parsePrismaSchema(SCHEMA));
    const kyc = drafts.find((d) => d.purposes[0] === 'kyc');
    expect(kyc).toMatchObject({
      lawfulBasis: 'legal_obligation',
      dataCategories: ['identifier.bvn'],
      dataSubjectCategories: ['customer'],
      retentionPeriod: 'P5Y',
      processors: ['smile-identity'],
      sourceFields: ['Customer.bvn'],
      provenanceStatus: 'asserted',
    });
    expect(drafts.find((d) => d.purposes[0] === 'account_service')?.lawfulBasis).toBe('contract');
    const care = drafts.find((d) => d.purposes[0] === 'care');
    expect(care?.sensitiveDataCategories).toEqual(['sensitive.health']);
    expect(care?.involvesChildren).toBe(true);
    expect(care?.automatedDecisionMaking).toBe(true);
    expect(drafts.flatMap((d) => d.sourceFields)).not.toContain('Patient.dateOfBirth');
  });
});
