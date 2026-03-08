import { NextResponse } from "next/server";

import { createSession, getTenant } from "@/lib/repository";
import { sessionInputSchema } from "@/lib/schemas";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = sessionInputSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: parsed.error.issues[0]?.message ?? "Invalid session input."
        },
        { status: 400 }
      );
    }

    const tenant = getTenant(parsed.data.tenantId);

    if (!tenant) {
      return NextResponse.json({ error: "Tenant not found." }, { status: 404 });
    }

    const session = createSession(parsed.data.tenantId, {
      roomType: parsed.data.roomType,
      locale: parsed.data.locale,
      widthCm: parsed.data.widthCm,
      depthCm: parsed.data.depthCm,
      door: parsed.data.door,
      window: parsed.data.window,
      fixtures: parsed.data.fixtures
    });

    return NextResponse.json({ session });
  } catch {
    return NextResponse.json({ error: "Unable to create session." }, { status: 500 });
  }
}
