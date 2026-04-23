import { NextResponse } from "next/server";

/**
 * In-memory consent store for demo purposes.
 * Replace with a real database in production.
 */
let consentStore: Record<string, unknown> = {};

export async function GET() {
  if (Object.keys(consentStore).length === 0) {
    return NextResponse.json(null, { status: 204 });
  }
  return NextResponse.json(consentStore);
}

export async function POST(request: Request) {
  const body = await request.json();
  consentStore = body;
  return NextResponse.json({ success: true }, { status: 200 });
}

export async function DELETE() {
  consentStore = {};
  return NextResponse.json({ success: true }, { status: 200 });
}
