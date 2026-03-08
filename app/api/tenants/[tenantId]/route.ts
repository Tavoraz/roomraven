import { NextResponse } from "next/server";

import { getTenant, updateTenant } from "@/lib/repository";
import { tenantUpdateSchema } from "@/lib/schemas";

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

  return NextResponse.json({ tenant });
}

export async function PUT(
  request: Request,
  context: {
    params: Promise<{ tenantId: string }>;
  }
) {
  try {
    const { tenantId } = await context.params;
    const tenant = getTenant(tenantId);

    if (!tenant) {
      return NextResponse.json({ error: "Tenant not found." }, { status: 404 });
    }

    const body = await request.json();
    const parsed = tenantUpdateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: parsed.error.issues[0]?.message ?? "Invalid tenant payload."
        },
        { status: 400 }
      );
    }

    const updated = updateTenant(tenantId, parsed.data);

    return NextResponse.json({ tenant: updated });
  } catch {
    return NextResponse.json({ error: "Unable to update tenant." }, { status: 500 });
  }
}
