import type { Locale, RoomType, Tenant } from "@/lib/types";

export interface DemoVariant {
  slug: string;
  tenantId: string;
  label: string;
  note: string;
  locale: Locale;
  roomType: RoomType;
}

export const DEMO_VARIANTS: DemoVariant[] = [
  {
    slug: "warm",
    tenantId: "praxis-demo",
    label: "Warm Natural",
    note: "Soft stone and oak",
    locale: "nl",
    roomType: "bathroom"
  },
  {
    slug: "bold",
    tenantId: "hornbach-demo",
    label: "Bold Contrast",
    note: "Dark accents and depth",
    locale: "en",
    roomType: "bathroom"
  },
  {
    slug: "light",
    tenantId: "ikea-demo",
    label: "Bright Minimal",
    note: "Clean lines and calm tones",
    locale: "en",
    roomType: "bathroom"
  }
];

export function getDefaultDemoVariant() {
  return DEMO_VARIANTS[0];
}

export function getDemoVariantBySlug(slug: string | null | undefined) {
  if (!slug) {
    return null;
  }

  return DEMO_VARIANTS.find((variant) => variant.slug === slug) ?? null;
}

export function getDemoVariantByTenantId(tenantId: string) {
  return DEMO_VARIANTS.find((variant) => variant.tenantId === tenantId) ?? null;
}

export function buildPublicDemoHref(variant: DemoVariant) {
  const params = new URLSearchParams({
    demo: variant.slug,
    locale: variant.locale,
    roomType: variant.roomType
  });

  return `/planner?${params.toString()}`;
}

export function listPublicDemoCards(tenants: Tenant[]) {
  return DEMO_VARIANTS.map((variant) => {
    const tenant = tenants.find((item) => item.id === variant.tenantId);

    if (!tenant) {
      return null;
    }

    return {
      ...variant,
      tenant,
      href: buildPublicDemoHref(variant)
    };
  }).filter((item): item is NonNullable<typeof item> => item !== null);
}
