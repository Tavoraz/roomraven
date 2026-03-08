import { notFound } from "next/navigation";

import { PlannerClient } from "@/components/planner-client";
import { ROOM_TYPES } from "@/lib/constants";
import { getDefaultDemoVariant, getDemoVariantBySlug } from "@/lib/demo-variants";
import { getTenant } from "@/lib/repository";
import type { Locale, RoomType } from "@/lib/types";

export const dynamic = "force-dynamic";

function resolveValue(value: string | string[] | undefined, fallback: string) {
  return Array.isArray(value) ? value[0] : value ?? fallback;
}

function resolveRoomType(value: string): RoomType {
  return ROOM_TYPES.includes(value as RoomType) ? (value as RoomType) : "bathroom";
}

export default async function PlannerPage({
  searchParams
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const demo = getDemoVariantBySlug(resolveValue(params.demo, ""));
  const defaultDemo = getDefaultDemoVariant();
  const tenantId = resolveValue(params.tenantId, demo?.tenantId ?? defaultDemo.tenantId);
  const locale = resolveValue(params.locale, demo?.locale ?? defaultDemo.locale) as Locale;
  const roomType = resolveRoomType(resolveValue(params.roomType, demo?.roomType ?? defaultDemo.roomType));
  const embed = resolveValue(params.embed, "0") === "1";
  const tenant = getTenant(tenantId);

  if (!tenant) {
    notFound();
  }

  return <PlannerClient tenant={tenant} initialLocale={locale} initialRoomType={roomType} embed={embed} />;
}
