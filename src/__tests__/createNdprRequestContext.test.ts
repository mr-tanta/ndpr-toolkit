import {
  getNDPRContextProblem as getNextProblem,
  resolveNDPRRequestContext as resolveNextContext,
  type NDPRRequestContext as NextContext,
  type NDPRVerifiedActor as NextActor,
} from '../../packages/create-ndpr/templates/nextjs-request-context';
import {
  getNDPRContextProblem as getExpressProblem,
  resolveNDPRRequestContext as resolveExpressContext,
} from '../../packages/create-ndpr/templates/express-request-context';

type StaffProblem = { status: 401 | 403 | 503; error: string } | null;
interface ContextHarness {
  name: string;
  resolve(actor: NextActor | null): Promise<NextContext>;
  getStaffProblem(context: NextContext): StaffProblem;
}

const nextRequest = {
  headers: new Headers(),
} as Parameters<typeof resolveNextContext>[0];
const expressRequest = {
  get: () => undefined,
} as unknown as Parameters<typeof resolveExpressContext>[0];

const harnesses: ContextHarness[] = [
  {
    name: 'Next.js',
    resolve: (actor) => resolveNextContext(nextRequest, async () => actor),
    getStaffProblem: (context) => getNextProblem(context, 'staff'),
  },
  {
    name: 'Express',
    resolve: (actor) => resolveExpressContext(expressRequest, async () => actor),
    getStaffProblem: (context) => getExpressProblem(context, 'staff'),
  },
];

const verifiedActor = (roles: readonly string[]): NextActor => ({
  id: 'staff-123',
  displayName: 'Verified Staff Member',
  email: 'staff@example.test',
  roles,
});

const originalTenant = process.env.NDPR_TENANT_ID;

afterEach(() => {
  if (originalTenant === undefined) delete process.env.NDPR_TENANT_ID;
  else process.env.NDPR_TENANT_ID = originalTenant;
});

describe.each(harnesses)('$name generated request context', (harness) => {
  test('rejects an unauthenticated staff request with 401', async () => {
    process.env.NDPR_TENANT_ID = 'tenant-from-server';
    const context = await harness.resolve(null);

    expect(harness.getStaffProblem(context)).toMatchObject({ status: 401 });
  });

  test('rejects an authenticated non-staff actor with 403', async () => {
    process.env.NDPR_TENANT_ID = 'tenant-from-server';
    const context = await harness.resolve(verifiedActor(['member']));

    expect(harness.getStaffProblem(context)).toMatchObject({ status: 403 });
  });

  test.each(['ndpr:staff', 'ndpr:admin'])('allows the %s role', async (role) => {
    process.env.NDPR_TENANT_ID = 'tenant-from-server';
    const context = await harness.resolve(verifiedActor([role]));

    expect(harness.getStaffProblem(context)).toBeNull();
  });

  test('fails closed with 503 when the server tenant is missing', async () => {
    delete process.env.NDPR_TENANT_ID;
    const context = await harness.resolve(verifiedActor(['ndpr:admin']));

    expect(harness.getStaffProblem(context)).toMatchObject({ status: 503 });
  });
});
