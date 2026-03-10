import { NextResponse } from "next/server";

import { getSession, listSessionOptions, submitVote } from "@/lib/repository";
import { voteSchema } from "@/lib/schemas";

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

    const body = await request.json();
    const parsed = voteSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: parsed.error.issues[0]?.message ?? "Invalid vote payload."
        },
        { status: 400 }
      );
    }

    const result = await submitVote(sessionId, parsed.data.winnerOptionId);

    return NextResponse.json({
      session: result.session,
      options: await listSessionOptions(sessionId),
      votes: result.votes
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unable to store vote."
      },
      { status: 400 }
    );
  }
}
