import { NextResponse } from "next/server";

import { getTenant, trackEvent } from "@/lib/repository";
import { visualizationRequestSchema } from "@/lib/schemas";
import { visualizeRoomConcept } from "@/lib/visualizer";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = visualizationRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: parsed.error.issues[0]?.message ?? "Invalid visualization request."
        },
        { status: 400 }
      );
    }

    const tenant = getTenant(parsed.data.tenantId);

    if (!tenant) {
      return NextResponse.json({ error: "Tenant not found." }, { status: 404 });
    }

    trackEvent({
      tenantId: tenant.id,
      sessionId: null,
      roomType: parsed.data.roomType,
      locale: parsed.data.locale,
      eventType: "session_started",
      metadata: {
        inspirationCount: parsed.data.inspirationImages.length,
        flow: "visualizer"
      }
    });

    const concept = await visualizeRoomConcept(tenant, parsed.data);

    trackEvent({
      tenantId: tenant.id,
      sessionId: null,
      roomType: parsed.data.roomType,
      locale: parsed.data.locale,
      eventType: "generation_succeeded",
      metadata: {
        renderMode: concept.renderMode,
        inspirationCount: parsed.data.inspirationImages.length,
        flow: "visualizer"
      }
    });

    return NextResponse.json({ concept });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unable to generate a room concept."
      },
      { status: 500 }
    );
  }
}
