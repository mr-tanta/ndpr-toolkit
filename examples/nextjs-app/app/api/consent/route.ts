import { NextResponse } from "next/server";
import {
  validateConsentStructured,
  type ConsentSettings,
} from "@tantainnovative/ndpr-toolkit/server";

/**
 * Production-oriented consent route reference.
 *
 * This example keeps data in memory so it can run without infrastructure, but
 * the request contract mirrors a database-backed implementation:
 * validate the server payload, persist the current consent snapshot, and append
 * immutable audit events for consent creation, update, and withdrawal.
 */
type ConsentAuditAction = "consent_given" | "consent_updated" | "consent_withdrawn";

interface ConsentAuditEntry {
  action: ConsentAuditAction;
  timestamp: number;
  version: string;
  categories: Record<string, boolean>;
  method: string;
  userAgent?: string;
  ipAddress?: string;
}

let consentStore: ConsentSettings | null = null;
let auditTrail: ConsentAuditEntry[] = [];

export async function GET() {
  if (!consentStore && auditTrail.length === 0) {
    return new Response(null, { status: 204 });
  }

  return NextResponse.json({
    consent: consentStore,
    auditTrail,
  });
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Body must be valid JSON.", fields: {} },
      { status: 400 },
    );
  }

  const { valid, errors, data } = validateConsentStructured(body as ConsentSettings);
  if (!valid || !data) {
    return NextResponse.json(
      {
        error: "Validation failed.",
        fields: Object.fromEntries(errors.map((error) => [error.field, error.message])),
      },
      { status: 400 },
    );
  }

  const auditEntry = createAuditEntry({
    current: data,
    previous: consentStore,
    request,
  });
  consentStore = data;
  auditTrail = [...auditTrail, auditEntry];

  return NextResponse.json(
    {
      success: true,
      consent: consentStore,
      auditEntry,
      auditTrailLength: auditTrail.length,
    },
    { status: 201 },
  );
}

export async function DELETE() {
  const previous = consentStore;
  consentStore = null;

  if (!previous) {
    return NextResponse.json({
      success: true,
      consent: null,
      auditTrailLength: auditTrail.length,
    });
  }

  const withdrawnSettings: ConsentSettings = {
    ...previous,
    consents: Object.fromEntries(Object.keys(previous.consents).map((key) => [key, false])),
    timestamp: Date.now(),
    method: "withdrawal",
    hasInteracted: true,
  };
  const auditEntry = createAuditEntry({
    current: withdrawnSettings,
    previous,
    action: "consent_withdrawn",
  });
  auditTrail = [...auditTrail, auditEntry];

  return NextResponse.json({
    success: true,
    consent: null,
    auditEntry,
    auditTrailLength: auditTrail.length,
  });
}

function createAuditEntry({
  action,
  current,
  previous,
  request,
}: {
  action?: ConsentAuditAction;
  current: ConsentSettings;
  previous: ConsentSettings | null;
  request?: Request;
}): ConsentAuditEntry {
  return {
    action: action ?? (previous ? "consent_updated" : "consent_given"),
    timestamp: current.timestamp || Date.now(),
    version: current.version,
    categories: { ...current.consents },
    method: current.method,
    userAgent: request?.headers.get("user-agent") ?? undefined,
    ipAddress: request?.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || undefined,
  };
}
