import { NextResponse } from "next/server";

import { getAnalyticsSummary, getTenant } from "@/lib/repository";

export async function GET(
  _request: Request,
  context: {
    params: Promise<{ tenantId: string }>;
  }
) {
  const { tenantId } = await context.params;
  const tenant = getTenant(tenantId);

  if (!tenant) {
    return NextResponse.json({ error: "Tenant not found." }, { status: 404 });
  }

  return NextResponse.json({
    analytics: getAnalyticsSummary(tenantId)
  });
}
