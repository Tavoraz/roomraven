import { headers } from "next/headers";
import { notFound } from "next/navigation";

import { AdminClient } from "@/components/admin-client";
import { getAnalyticsSummary, getLatestCatalogImport, getTenant, listTenants } from "@/lib/repository";

export const dynamic = "force-dynamic";

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
  const tenant = getTenant(tenantId);

  if (!tenant) {
    notFound();
  }

  const headerStore = await headers();
  const protocol = headerStore.get("x-forwarded-proto") ?? "http";
  const host = headerStore.get("host") ?? "localhost:3000";

  return (
    <AdminClient
      tenants={listTenants()}
      tenant={tenant}
      analytics={getAnalyticsSummary(tenantId)}
      latestCatalogImport={getLatestCatalogImport(tenantId)}
      baseUrl={`${protocol}://${host}`}
    />
  );
}
