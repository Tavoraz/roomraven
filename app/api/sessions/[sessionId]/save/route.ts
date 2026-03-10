import { NextResponse } from "next/server";

import { buildShoppingList } from "@/lib/shopping-list";
import { createSavedProject, getLatestCatalogImport, getLayoutOption, getSession, getTenant } from "@/lib/repository";
import { saveProjectSchema } from "@/lib/schemas";

export async function POST(
  request: Request,
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

    if (!session.winnerOptionId) {
      return NextResponse.json({ error: "A winning layout is required before saving." }, { status: 400 });
    }

    const body = await request.json();
    const parsed = saveProjectSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: parsed.error.issues[0]?.message ?? "Invalid save payload."
        },
        { status: 400 }
      );
    }

    const tenant = await getTenant(session.tenantId);
    const winner = await getLayoutOption(session.winnerOptionId);

    if (!tenant || !winner) {
      return NextResponse.json({ error: "Session data is incomplete." }, { status: 400 });
    }

    const latestCatalogImport = await getLatestCatalogImport(tenant.id);
    const shoppingList = buildShoppingList(tenant, winner, latestCatalogImport);
    const savedProject = await createSavedProject(sessionId, parsed.data.email, session.locale, shoppingList);
    const origin = new URL(request.url).origin;

    if (!savedProject) {
      return NextResponse.json({ error: "Unable to retrieve saved project." }, { status: 500 });
    }

    return NextResponse.json({
      project: savedProject.project,
      magicLink: `${origin}/saved/${savedProject.project.token}`
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unable to save project."
      },
      { status: 500 }
    );
  }
}
