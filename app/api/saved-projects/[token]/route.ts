import { NextResponse } from "next/server";

import { getSavedProject } from "@/lib/repository";

export async function GET(
  _request: Request,
  context: {
    params: Promise<{ token: string }>;
  }
) {
  const { token } = await context.params;
  const project = getSavedProject(token);

  if (!project) {
    return NextResponse.json({ error: "Saved project not found." }, { status: 404 });
  }

  return NextResponse.json(project);
}
