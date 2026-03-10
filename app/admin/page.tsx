import type { Metadata } from "next";
import { headers } from "next/headers";
import { notFound } from "next/navigation";

import { AdminClient } from "@/components/admin-client";
import { getAnalyticsSummary, getLatestCatalogImport, getTenant, listTenants } from "@/lib/repository";
import { buildPageMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";
export const metadata: Metadata = buildPageMetadata({
  title: "Admin Dashboard | RoomRaven",
  description: "Private RoomRaven admin dashboard.",
  path: "/admin",
  noIndex: true
});

function resolveValue(value: string | string[] | undefined, fallback: string) {
  return Array.isArray(value) ? value[0] : value ?? fallback;
}

export default async function AdminPage({
  searchParams
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const tenantId = resolveValue(params.tenantId, "praxis-demo");
  const tenant = await getTenant(tenantId);

  if (!tenant) {
    notFound();
  }

  const headerStore = await headers();
  const protocol = headerStore.get("x-forwarded-proto") ?? "http";
  const host = headerStore.get("host") ?? "localhost:3000";
  const [tenants, analytics, latestCatalogImport] = await Promise.all([
    listTenants(),
    getAnalyticsSummary(tenantId),
    getLatestCatalogImport(tenantId)
  ]);

  return (
    <AdminClient
      tenants={tenants}
      tenant={tenant}
      analytics={analytics}
      latestCatalogImport={latestCatalogImport}
      baseUrl={`${protocol}://${host}`}
    />
  );
}
