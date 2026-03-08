import { NextResponse } from "next/server";
import { z } from "zod";

import { trackEvent } from "@/lib/repository";
import { localeSchema, roomTypeSchema } from "@/lib/schemas";

const eventSchema = z.object({
  tenantId: z.string().min(1),
  sessionId: z.string().nullable(),
  roomType: roomTypeSchema,
  locale: localeSchema,
  eventType: z.string().min(2),
  metadata: z.record(z.string(), z.unknown())
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = eventSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: parsed.error.issues[0]?.message ?? "Invalid analytics event."
        },
        { status: 400 }
      );
    }

    trackEvent(parsed.data);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Unable to record analytics event." }, { status: 500 });
  }
}
