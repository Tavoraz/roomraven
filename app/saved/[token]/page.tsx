import { notFound } from "next/navigation";

import { SavedProjectClient } from "@/components/saved-project-client";
import { getSavedProject } from "@/lib/repository";

export const dynamic = "force-dynamic";

export default async function SavedProjectPage({
  params
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const saved = getSavedProject(token);

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
