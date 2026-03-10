import { NextRequest, NextResponse } from "next/server";

import { getTenant, trackEvent } from "@/lib/repository";
import { visualizationRequestSchema } from "@/lib/schemas";
import { visualizeRoomConcept } from "@/lib/visualizer";

const CONSUMER_LIMIT_COOKIE = "roomraven-consumer-generation-day";

function consumerPlannerDay() {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Amsterdam" }).format(new Date());
}

export async function POST(request: NextRequest) {
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

    const tenant = await getTenant(parsed.data.tenantId);

    if (!tenant) {
      return NextResponse.json({ error: "Tenant not found." }, { status: 404 });
    }

    if (parsed.data.audience === "consumer") {
      const today = consumerPlannerDay();
      const lastGenerationDay = request.cookies.get(CONSUMER_LIMIT_COOKIE)?.value;

      if (lastGenerationDay === today) {
        return NextResponse.json(
          {
            error: "Free accounts can generate 1 concept per day. Come back tomorrow for a new one."
          },
          { status: 429 }
        );
      }
    }

    await trackEvent({
      tenantId: tenant.id,
      sessionId: null,
      roomType: parsed.data.roomType,
      locale: parsed.data.locale,
      eventType: "session_started",
      metadata: {
        inspirationCount: parsed.data.inspirationImages.length,
        flow: "visualizer",
        audience: parsed.data.audience
      }
    });

    const concept = await visualizeRoomConcept(tenant, parsed.data);

    await trackEvent({
      tenantId: tenant.id,
      sessionId: null,
      roomType: parsed.data.roomType,
      locale: parsed.data.locale,
      eventType: "generation_completed",
      metadata: {
        renderMode: concept.renderMode,
        inspirationCount: parsed.data.inspirationImages.length,
        flow: "visualizer",
        audience: parsed.data.audience
      }
    });

    const response = NextResponse.json({ concept });

    if (parsed.data.audience === "consumer") {
      response.cookies.set(CONSUMER_LIMIT_COOKIE, consumerPlannerDay(), {
        httpOnly: false,
        maxAge: 60 * 60 * 48,
        path: "/",
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production"
      });
    }

    return response;
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unable to generate a room concept."
      },
      { status: 500 }
    );
  }
}
