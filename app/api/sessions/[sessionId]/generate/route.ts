import { NextResponse } from "next/server";

import { generateLayoutOptions } from "@/lib/layout-engine";
import { renderLayoutOption } from "@/lib/rendering";
import { getSession, getTenant, listSessionOptions, storeGeneratedOptions } from "@/lib/repository";
import { makeId, nowIso } from "@/lib/utils";

export async function POST(
  _request: Request,
  context: {
    params: Promise<{ sessionId: string }>;
  }
) {
  try {
    const { sessionId } = await context.params;
    const session = await getSession(sessionId);

    if (!session) {
      return NextResponse.json({ error: "Session not found." }, { status: 404 });
    }

    const tenant = await getTenant(session.tenantId);

    if (!tenant) {
      return NextResponse.json({ error: "Tenant not found." }, { status: 404 });
    }

    const layouts = generateLayoutOptions(session.input);
    const generatedOptions = await Promise.all(
      layouts.map(async (layout, index) => {
        const visual = await renderLayoutOption(tenant, session.input, layout.layout, index);
        return {
          id: makeId("option"),
          createdAt: nowIso(),
          rankIndex: layout.rankIndex,
          score: layout.score,
          renderMode: visual.renderMode,
          imageUrl: visual.imageUrl,
          fallbackSvg: visual.fallbackSvg,
          prompt: visual.prompt,
          layout: layout.layout
        };
      })
    );

    const updatedSession = await storeGeneratedOptions(sessionId, generatedOptions);

    return NextResponse.json({
      session: updatedSession,
      options: await listSessionOptions(sessionId)
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unable to generate layouts."
      },
      { status: 500 }
    );
  }
}
