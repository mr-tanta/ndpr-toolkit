import { NextResponse } from "next/server";

interface DSRSubmission {
  requestType?: unknown;
  dataSubject?: unknown;
}

export async function POST(request: Request) {
  let payload: DSRSubmission;
  try {
    payload = (await request.json()) as DSRSubmission;
  } catch {
    return NextResponse.json(
      { error: "Body must be valid JSON." },
      { status: 400 },
    );
  }

  if (!payload.requestType || !payload.dataSubject) {
    return NextResponse.json(
      { error: "Missing requestType or dataSubject." },
      { status: 400 },
    );
  }

  const referenceId = `DSR-${Date.now().toString(36).toUpperCase()}`;
  const estimatedCompletionAt = new Date(
    Date.now() + 30 * 24 * 60 * 60 * 1000,
  ).toISOString();

  // Stub. A production handler would persist this to a database, queue an
  // identity-verification email to the data subject, and notify the DPO via
  // their case-management system. See examples/nextjs-app for a fuller flow.
  return NextResponse.json(
    {
      referenceId,
      status: "received",
      estimatedCompletionAt,
    },
    { status: 201 },
  );
}
