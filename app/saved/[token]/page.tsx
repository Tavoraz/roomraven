import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { SavedProjectClient } from "@/components/saved-project-client";
import { getSavedProject } from "@/lib/repository";
import { buildPageMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";
export const metadata: Metadata = buildPageMetadata({
  title: "Saved Project | RoomRaven",
  description: "Private saved RoomRaven project.",
  path: "/saved",
  noIndex: true
});

export default async function SavedProjectPage({
  params
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const saved = await getSavedProject(token);

  if (!saved?.project || !saved.session || !saved.winner || !saved.tenant) {
    notFound();
  }

  return (
    <SavedProjectClient
      project={saved.project}
      session={saved.session}
      winner={saved.winner}
      tenant={saved.tenant}
    />
  );
}
